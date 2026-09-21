import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createOrder, findCustomerByEmail, createCustomer } from '@/lib/woocommerce'
import { createRazorpayOrder } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Please sign in to place an order' }, { status: 401 })
  }

  try {
    const { cart, customer } = await request.json()

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const customerEmail = (session.user.email as string) || customer.email || ''
    let customerId = 0
    if (customerEmail) {
      const existing = await findCustomerByEmail(customerEmail)
      if (existing) {
        customerId = existing.id
      } else {
        const username = customerEmail.split('@')[0] + '-' + Math.random().toString(36).slice(2, 8)
        const newCustomer = await createCustomer({
          email: customerEmail,
          first_name: customer.firstName || '',
          last_name: customer.lastName || '',
          username,
          password: Math.random().toString(36).slice(2) + Date.now().toString(36),
        })
        customerId = newCustomer.id
      }
    }

    const subtotal = cart.reduce(
      (sum: number, item: any) => sum + Number(item.price || 0) * Number(item.qty || 1),
      0
    )

    const order = await createOrder({
      payment_method: 'razorpay',
      payment_method_title: 'Razorpay (Cards / UPI / NetBanking)',
      set_paid: false,
      customer_id: customerId,
      billing: {
        first_name: customer.firstName || '',
        last_name: customer.lastName || '',
        address_1: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        postcode: customer.postcode || '',
        country: customer.country || 'IN',
        email: customer.email || '',
        phone: customer.phone || '',
      },
      shipping: {
        first_name: customer.firstName || '',
        last_name: customer.lastName || '',
        address_1: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        postcode: customer.postcode || '',
        country: customer.country || 'IN',
      },
      line_items: cart.map((item: any) => ({
        product_id: Number(item.id),
        quantity: Number(item.qty) || 1,
      })),
    })

    const razorpayOrder = await createRazorpayOrder({
      amount: subtotal,
      receipt: order.id.toString(),
      notes: { email: customerEmail, order_id: order.id.toString() },
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 })
  }
}
