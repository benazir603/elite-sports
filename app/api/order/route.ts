import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createOrder, createCustomer, findCustomerByEmail, getProductById, getProductVariation, updateOrder } from '@/lib/woocommerce'
import { createRazorpayOrder } from '@/lib/razorpay'

const MAX_CART_ITEMS = 50
const MAX_QUANTITY = 20

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

function parseCustomer(value: unknown, sessionEmail: string): CheckoutCustomer | null {
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

  if (!customer.firstName || !customer.lastName || !customer.phone || !customer.address || !customer.city || !customer.state || !customer.postcode || customer.country !== 'IN') {
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
    const body = await request.json()
    const cart = parseCart(body.cart)
    const customer = parseCustomer(body.customer, sessionEmail)
    if (!cart) {
      return NextResponse.json({ error: 'Your cart is invalid' }, { status: 400 })
    }
    if (!customer) {
      return NextResponse.json({ error: 'Please provide valid Indian billing and shipping details' }, { status: 400 })
    }

    const purchasableItems = await Promise.all(cart.map(async (item) => {
      const product = await getProductById(item.productId, true)
      if (product.status !== 'publish') {
        throw new Error(`${product.name || 'A cart item'} is not available for purchase`)
      }
      if (product.type === 'variable' && !item.variationId) {
        throw new Error(`Select options for ${product.name}`)
      }
      if (product.type !== 'variable' && item.variationId) {
        throw new Error(`Invalid variation for ${product.name}`)
      }
      const variation = item.variationId ? await getProductVariation(item.productId, item.variationId) : null
      const price = Number(variation?.price ?? product.price)
      const stockStatus = variation?.stock_status ?? product.stock_status
      const stockQuantity = variation?.stock_quantity ?? product.stock_quantity
      if (
        stockStatus !== 'instock' ||
        (variation && (variation.status !== 'publish' || !variation.purchasable)) ||
        !Number.isFinite(price) || price <= 0
      ) {
        throw new Error(`${product.name} is not available for purchase`)
      }
      if (stockQuantity !== null && item.quantity > stockQuantity) {
        throw new Error(`Only ${stockQuantity} units of ${product.name} are available`)
      }
      return { item, product, price }
    }))
    const lineItems = purchasableItems.map(({ item, price }) => {
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
          username: `${sessionEmail.split('@')[0]}-${crypto.randomUUID().slice(0, 8)}`,
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
    const order = await createOrder({
      payment_method: 'razorpay',
      payment_method_title: 'Razorpay (Cards / UPI / NetBanking)',
      set_paid: false,
      customer_id: customerId,
      billing: { ...address, email: sessionEmail, phone: customer.phone },
      shipping: address,
      line_items: lineItems,
      meta_data: [{ key: '_elite_payment_owner', value: sessionEmail }],
    })
    wooOrderId = order.id
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
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error: unknown) {
    if (wooOrderId) {
      try {
        await updateOrder(wooOrderId, { status: 'failed' })
      } catch (updateError) {
        console.error('Could not mark incomplete order as failed:', updateError)
      }
    }
    console.error('Order creation error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
