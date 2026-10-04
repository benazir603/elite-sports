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

function safeEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value, 'utf8')
  const expectedBuffer = Buffer.from(expected, 'utf8')
  return valueBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(valueBuffer, expectedBuffer)
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
  return safeEqual(signature, expected)
}

export function verifyRazorpayWebhook(body: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is not set')
  }
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return safeEqual(signature, expected)
}

export async function getRazorpayPayment(paymentId: string) {
  const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Razorpay payment lookup failed: ${res.status}`)
  }
  return res.json() as Promise<{
    id: string
    order_id: string
    amount: number
    currency: string
    status: string
  }>
}

export async function getRazorpayOrder(orderId: string) {
  const res = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Razorpay order lookup failed: ${res.status}`)
  }
  return res.json() as Promise<{
    id: string
    amount: number
    currency: string
    receipt: string
  }>
}
