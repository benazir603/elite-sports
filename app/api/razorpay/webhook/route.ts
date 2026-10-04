import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrder } from '@/lib/woocommerce'
import { getRazorpayOrder, getRazorpayPayment, verifyRazorpayWebhook } from '@/lib/razorpay'

interface RazorpayWebhook {
  event?: string
  payload?: {
    payment?: {
      entity?: {
        id?: string
        order_id?: string
      }
    }
  }
}

function getMeta(order: { meta_data?: { key: string; value: string }[] }, key: string) {
  return order.meta_data?.find((item) => item.key === key)?.value
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature') || ''

  try {
    if (!signature || !verifyRazorpayWebhook(body, signature)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const event = JSON.parse(body) as RazorpayWebhook
    if (event.event !== 'payment.captured' && event.event !== 'order.paid') {
      return NextResponse.json({ received: true })
    }

    const paymentId = event.payload?.payment?.entity?.id
    const razorpayOrderId = event.payload?.payment?.entity?.order_id
    if (!paymentId || !razorpayOrderId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    const [payment, razorpayOrder] = await Promise.all([
      getRazorpayPayment(paymentId),
      getRazorpayOrder(razorpayOrderId),
    ])
    const orderId = Number(razorpayOrder.receipt)
    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ error: 'Invalid order receipt' }, { status: 400 })
    }

    const order = await getOrderById(orderId)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const expectedAmount = Math.round(Number(order.total) * 100)
    if (
      getMeta(order, '_razorpay_order_id') !== razorpayOrderId ||
      razorpayOrder.id !== razorpayOrderId ||
      payment.order_id !== razorpayOrderId ||
      payment.amount !== expectedAmount ||
      razorpayOrder.amount !== expectedAmount ||
      payment.currency !== 'INR' ||
      razorpayOrder.currency !== 'INR' ||
      payment.status !== 'captured'
    ) {
      return NextResponse.json({ error: 'Payment does not match order' }, { status: 400 })
    }

    if (order.status !== 'processing' && order.status !== 'completed') {
      await updateOrder(order.id, {
        status: 'processing',
        set_paid: true,
        meta_data: [
          { key: '_razorpay_order_id', value: razorpayOrderId },
          { key: '_razorpay_payment_id', value: paymentId },
        ],
      })
    }

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
