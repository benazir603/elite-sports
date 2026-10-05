import { NextRequest, NextResponse } from 'next/server'

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL || ''
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD || ''
const PICKUP_POSTCODE = process.env.SHIPROCKET_PICKUP_POSTCODE || '600126'

let tokenCache: { token: string; at: number } | null = null

async function getToken() {
  if (tokenCache && Date.now() - tokenCache.at < 8 * 24 * 60 * 60 * 1000) {
    return tokenCache.token
  }
  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }),
  })
  if (!res.ok) throw new Error('Shiprocket auth failed')
  const data = await res.json()
  tokenCache = { token: data.token, at: Date.now() }
  return data.token as string
}

export async function GET(request: NextRequest) {
  const pincode = request.nextUrl.searchParams.get('pincode')?.trim() || ''

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ serviceable: false, message: 'Please enter a valid 6-digit pincode' }, { status: 400 })
  }

  // Fallback when Shiprocket is not configured
  if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
    return NextResponse.json({ serviceable: true, eta: '5-7 days', courier: 'Standard delivery' })
  }

  try {
    const token = await getToken()
    const url = new URL('https://apiv2.shiprocket.in/v1/external/courier/serviceability/')
    url.searchParams.set('pickup_postcode', PICKUP_POSTCODE)
    url.searchParams.set('delivery_postcode', pincode)
    url.searchParams.set('weight', '0.5')
    url.searchParams.set('cod', '0')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Serviceability check failed: ${res.status}`)

    const data = await res.json()
    const couriers = data?.data?.available_courier_companies || []

    if (couriers.length === 0) {
      return NextResponse.json({ serviceable: false, message: 'Delivery is not available to this pincode' })
    }

    const best = couriers[0]
    const eta = best.etd || best.delivery_days || '5-7 days'
    return NextResponse.json({
      serviceable: true,
      eta: typeof eta === 'string' && eta.includes('-') ? eta : `${eta}`,
      courier: best.courier_name || 'Courier partner',
    })
  } catch {
    return NextResponse.json({ serviceable: true, eta: '5-7 days', courier: 'Standard delivery' })
  }
}
