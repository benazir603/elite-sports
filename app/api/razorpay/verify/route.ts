import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getOrderById, updateOrder } from '@/lib/woocommerce'
import { getRazorpayPayment, verifyRazorpayPayment } from '@/lib/razorpay'

function getMeta(order: { meta_data?: { key: string; value: string }[] }, key: string) {
  return order.meta_data?.find((item) => item.key === key)?.value
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const sessionEmail = session?.user?.email?.trim().toLowerCase()
  if (!sessionEmail) {
    return NextResponse.json({ error: 'Please sign in to verify payment' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const paymentId = typeof body.razorpay_payment_id === 'string' ? body.razorpay_payment_id : ''
    const razorpayOrderId = typeof body.razorpay_order_id === 'string' ? body.razorpay_order_id : ''
    const signature = typeof body.razorpay_signature === 'string' ? body.razorpay_signature : ''
    const orderId = Number(body.orderId)

    if (!paymentId || !razorpayOrderId || !signature || !Number.isSafeInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }
    if (!verifyRazorpayPayment({ orderId: razorpayOrderId, paymentId, signature })) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const [order, payment] = await Promise.all([getOrderById(orderId), getRazorpayPayment(paymentId)])
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const boundOrderId = getMeta(order, '_razorpay_order_id')
    const owner = getMeta(order, '_elite_payment_owner')?.toLowerCase()
    const expectedAmount = Math.round(Number(order.total) * 100)
    if (boundOrderId !== razorpayOrderId || payment.order_id !== razorpayOrderId || owner !== sessionEmail) {
      return NextResponse.json({ error: 'Payment does not match this order' }, { status: 400 })
    }
    if (payment.amount !== expectedAmount || payment.currency !== 'INR') {
      return NextResponse.json({ error: 'Payment amount does not match this order' }, { status: 400 })
    }
    if (payment.status !== 'captured') {
      return NextResponse.json({ error: 'Payment has not been captured' }, { status: 409 })
    }

    if (order.status !== 'processing' && order.status !== 'completed') {
      await updateOrder(orderId, {
        status: 'processing',
        set_paid: true,
        meta_data: [
          { key: '_razorpay_order_id', value: razorpayOrderId },
          { key: '_razorpay_payment_id', value: paymentId },
          { key: '_elite_payment_owner', value: sessionEmail },
        ],
      })
    }

    return NextResponse.json({ success: true, message: 'Payment verified' })
  } catch (error: unknown) {
    console.error('Razorpay verify error:', error)
    return NextResponse.json({ error: 'Could not verify payment' }, { status: 500 })
  }
}
