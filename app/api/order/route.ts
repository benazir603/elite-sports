import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createOrder, createCustomer, findCustomerByEmail, getProductById, getProductVariation, updateOrder, sanitizeWooUsername } from '@/lib/woocommerce'
import { fetchStock, releaseReservation, releaseStaleReservations } from '@/lib/inventory'
import { resolveStock, stockMessage } from '@/lib/stock'
import { createRazorpayOrder } from '@/lib/razorpay'
import { calculateShipping, getShippingZone, itemWeightKg, ZONE_LABELS } from '@/lib/shipping'

const MAX_CART_ITEMS = 50
const MAX_QUANTITY = 20

/** Cart item that can't be fulfilled at the requested quantity right now. */
class StockConflictError extends Error {
  item?: string
  constructor(message: string, item?: string) {
    super(message)
    this.item = item
  }
}

interface CheckoutCustomer {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postcode: string
  country: string
}

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function parseCustomer(value: unknown, sessionEmail: string, isPickup: boolean): CheckoutCustomer | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>
  const customer = {
    firstName: clean(input.firstName, 100),
    lastName: clean(input.lastName, 100),
    email: sessionEmail,
    phone: clean(input.phone, 30),
    address: clean(input.address, 200),
    city: clean(input.city, 100),
    state: clean(input.state, 100),
    postcode: clean(input.postcode, 20),
    country: clean(input.country, 2).toUpperCase(),
  }

  if (!customer.firstName || !customer.lastName || !customer.phone || customer.country !== 'IN') {
    return null
  }
  if (!isPickup && (!customer.address || !customer.city || !customer.state || !customer.postcode)) {
    return null
  }
  return customer
}

function parseCart(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_CART_ITEMS) return null
  const items = new Map<string, { productId: number; variationId?: number; quantity: number }>()
  for (const item of value) {
    if (!item || typeof item !== 'object') return null
    const input = item as Record<string, unknown>
    const productId = Number(input.id)
    const variationId = input.variationId === undefined ? undefined : Number(input.variationId)
    const quantity = Number(input.qty)
    if (
      !Number.isSafeInteger(productId) || productId <= 0 ||
      (variationId !== undefined && (!Number.isSafeInteger(variationId) || variationId <= 0)) ||
      !Number.isSafeInteger(quantity) || quantity <= 0
    ) return null
    const key = `${productId}:${variationId || 0}`
    const combinedQuantity = (items.get(key)?.quantity || 0) + quantity
    if (combinedQuantity > MAX_QUANTITY) return null
    items.set(key, { productId, variationId, quantity: combinedQuantity })
  }
  return [...items.values()]
}

export async function POST(request: NextRequest) {
  const session = await auth()
  const sessionEmail = session?.user?.email?.trim().toLowerCase()
  if (!sessionEmail) {
    return NextResponse.json({ error: 'Please sign in to place an order' }, { status: 401 })
  }

  let wooOrderId: number | null = null
  try {
    // Best-effort cleanup of abandoned unpaid reservations so their stock is freed.
    void releaseStaleReservations()
    const body = await request.json()
    const isPickup = body.fulfilment === 'pickup'
    const cart = parseCart(body.cart)
    const customer = parseCustomer(body.customer, sessionEmail, isPickup)
    if (!cart) {
      return NextResponse.json({ error: 'Your cart is invalid' }, { status: 400 })
    }
    if (!customer) {
      return NextResponse.json({ error: 'Please provide valid Indian billing and shipping details' }, { status: 400 })
    }

    // Live stock check against WooCommerce (source of truth). Runs before any
    // order is created so customers get a clear message instead of a failed order.
    const purchasableItems = await Promise.all(cart.map(async (item) => {
      const product = await getProductById(item.productId, true)
      if (product.type === 'variable' && !item.variationId) {
        throw new StockConflictError(`Select options for ${product.name}`)
      }
      if (product.type !== 'variable' && item.variationId) {
        throw new StockConflictError(`Invalid variation for ${product.name}`)
      }
      const variation = item.variationId ? await getProductVariation(item.productId, item.variationId) : null
      const stock = resolveStock(product, variation)
      const available = stock.available === null ? MAX_QUANTITY : Math.min(stock.available, MAX_QUANTITY)
      if (!stock.purchasable || item.quantity > available) {
        throw new StockConflictError(stockMessage(stock.purchasable ? available : 0), stock.name)
      }
      return { item, product, price: stock.price }
    }))
    const lineItems = purchasableItems.map(({ item, price }: { item: { productId: number; variationId?: number; quantity: number }; price: number }) => {
      const total = (price * item.quantity).toFixed(2)
      return {
        product_id: item.productId,
        variation_id: item.variationId,
        quantity: item.quantity,
        subtotal: total,
        total,
      }
    })
    let customerId = 0
    const sessionWooCustomerId = (session?.user as any)?.wooCustomerId
    if (typeof sessionWooCustomerId === 'number') {
      customerId = sessionWooCustomerId
    } else {
      const existing = await findCustomerByEmail(sessionEmail)
      if (existing) {
        customerId = existing.id
      } else {
        const newCustomer = await createCustomer({
          email: sessionEmail,
          first_name: customer.firstName,
          last_name: customer.lastName,
          username: sanitizeWooUsername(sessionEmail.split('@')[0], crypto.randomUUID().slice(0, 8)),
          password: crypto.randomBytes(32).toString('base64url'),
        })
        customerId = newCustomer.id
      }
    }

    const address = {
      first_name: customer.firstName,
      last_name: customer.lastName,
      address_1: customer.address,
      city: customer.city,
      state: customer.state,
      postcode: customer.postcode,
      country: customer.country,
    }

    const totalWeightKg = purchasableItems.reduce(
      (sum, { item, product }) => sum + itemWeightKg(product.weight) * item.quantity,
      0
    )
    const shippingZone = getShippingZone(customer.state, customer.postcode)
    const shippingCharge = isPickup ? 0 : calculateShipping(totalWeightKg, shippingZone)

    // 'on-hold' makes WooCommerce decrement stock immediately — that is the
    // reservation. It is released by 'cancelled'/'failed' if payment never completes.
    const order = await createOrder({
      payment_method: 'razorpay',
      payment_method_title: 'Razorpay (Cards / UPI / NetBanking)',
      set_paid: false,
      status: 'on-hold',
      customer_id: customerId,
      billing: { ...address, email: sessionEmail, phone: customer.phone },
      ...(isPickup
        ? { shipping_lines: [{ method_id: 'local_pickup', method_title: 'Customer Pickup — Chennai Store', total: '0.00' }] }
        : {
            shipping: address,
            shipping_lines: [{
              method_id: 'flat_rate',
              method_title: `Courier — ${ZONE_LABELS[shippingZone]}`,
              total: shippingCharge.toFixed(2),
            }],
          }),
      line_items: lineItems,
      meta_data: [
        { key: '_elite_payment_owner', value: sessionEmail },
        { key: '_elite_fulfilment', value: isPickup ? 'pickup' : 'delivery' },
        ...(isPickup ? [] : [
          { key: '_elite_shipping_zone', value: shippingZone },
          { key: '_elite_shipping_weight_kg', value: totalWeightKg.toFixed(3) },
        ]),
      ],
    })
    wooOrderId = order.id

    // Race guard: two checkouts can both pass the earlier check. Re-read stock
    // after reserving — if WooCommerce went negative, release and reject.
    for (const { item } of purchasableItems) {
      const after = await fetchStock(item.productId, item.variationId)
      if (after.available !== null && after.available < 0) {
        await releaseReservation(order.id)
        wooOrderId = null
        throw new StockConflictError(stockMessage(0), after.name)
      }
    }

    const orderTotal = Number(order.total)
    if (!Number.isFinite(orderTotal) || orderTotal <= 0) {
      throw new Error('WooCommerce returned an invalid order total')
    }

    const razorpayOrder = await createRazorpayOrder({
      amount: orderTotal,
      receipt: order.id.toString(),
      notes: { email: sessionEmail, order_id: order.id.toString() },
    })
    await updateOrder(order.id, {
      meta_data: [
        { key: '_elite_payment_owner', value: sessionEmail },
        { key: '_razorpay_order_id', value: razorpayOrder.id },
      ],
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      shippingCharge,
      shippingZone: isPickup ? undefined : shippingZone,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error: unknown) {
    if (wooOrderId) {
      try {
        // 'cancelled' restores the reserved stock in WooCommerce.
        await updateOrder(wooOrderId, { status: 'cancelled' })
      } catch (updateError) {
        console.error('Could not release incomplete order reservation:', updateError)
      }
    }
    if (error instanceof StockConflictError) {
      return NextResponse.json({ error: error.message, item: error.item }, { status: 409 })
    }
    console.error('Order creation error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
