import crypto from 'node:crypto'

const KEY_ID = process.env.RAZORPAY_KEY_ID
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

function getAuthHeaders() {
  if (!KEY_ID || !KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env.local')
  }
  const token = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64')
  return { Authorization: `Basic ${token}`, 'Content-Type': 'application/json' }
}

export async function createRazorpayOrder({
  amount,
  receipt,
  notes,
}: {
  amount: number
  receipt: string
  notes?: Record<string, string>
}) {
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt,
      payment_capture: 1,
      notes,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Razorpay order creation failed: ${res.status} ${text}`)
  }

  return res.json() as Promise<{ id: string; amount: number; currency: string }>
}

export function verifyRazorpayPayment({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string
  paymentId: string
  signature: string
}) {
  if (!KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_SECRET is not set')
  }
  const expected = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}
