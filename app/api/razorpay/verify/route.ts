import { NextRequest, NextResponse } from 'next/server'
import { updateOrder } from '@/lib/woocommerce'
import { verifyRazorpayPayment } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId,
    } = (await req.json()) as {
      razorpay_payment_id?: string
      razorpay_order_id?: string
      razorpay_signature?: string
      orderId?: number
    }

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    const valid = verifyRazorpayPayment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })

    if (!valid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    await updateOrder(orderId, { status: 'processing', set_paid: true })

    return NextResponse.json({ success: true, message: 'Payment verified' })
  } catch (err: any) {
    console.error('Razorpay verify error:', err)
    return NextResponse.json({ error: err.message || 'Could not verify payment' }, { status: 500 })
  }
}
