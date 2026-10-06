import { NextRequest, NextResponse } from 'next/server'

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL?.trim() || ''
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD || ''
const PICKUP_POSTCODE = process.env.SHIPROCKET_PICKUP_POSTCODE?.trim() || ''

let tokenCache: { token: string; at: number } | null = null

async function getToken() {
  if (tokenCache && Date.now() - tokenCache.at < 8 * 24 * 60 * 60 * 1000) {
    return tokenCache.token
  }

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }),
    cache: 'no-store',
  })

  if (!res.ok) throw new Error('Shiprocket authentication failed')

  const data = await res.json()
  if (typeof data?.token !== 'string' || !data.token) throw new Error('Shiprocket token missing')

  tokenCache = { token: data.token, at: Date.now() }
  return data.token as string
}

export async function GET(request: NextRequest) {
  const pincode = request.nextUrl.searchParams.get('pincode')?.trim() || ''
  const weight = Number(request.nextUrl.searchParams.get('weight'))

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      { serviceable: false, message: 'Please enter a valid 6-digit PIN code' },
      { status: 400 }
    )
  }

  if (!Number.isFinite(weight) || weight <= 0 || weight > 1000) {
    return NextResponse.json(
      { serviceable: false, message: 'Delivery check is unavailable for this product. Please contact support.' },
      { status: 400 }
    )
  }

  if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD || !/^\d{6}$/.test(PICKUP_POSTCODE)) {
    return NextResponse.json(
      { serviceable: false, message: 'Delivery check is temporarily unavailable. Please contact support.' },
      { status: 503 }
    )
  }

  try {
    const token = await getToken()
    const url = new URL('https://apiv2.shiprocket.in/v1/external/courier/serviceability/')
    url.searchParams.set('pickup_postcode', PICKUP_POSTCODE)
    url.searchParams.set('delivery_postcode', pincode)
    url.searchParams.set('weight', weight.toFixed(3))
    url.searchParams.set('cod', '0')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    if (!res.ok) throw new Error(`Shiprocket serviceability failed: ${res.status}`)

    const data = await res.json()
    const couriers = Array.isArray(data?.data?.available_courier_companies)
      ? data.data.available_courier_companies
      : []

    if (couriers.length === 0) {
      return NextResponse.json({
        serviceable: false,
        message: 'No prepaid delivery service is currently available to this PIN code.',
      })
    }

    const recommendedId = data?.data?.recommended_courier_company_id
    const best = couriers.find((courier: { courier_company_id?: number }) => courier.courier_company_id === recommendedId) || couriers[0]
    const eta = best.etd || (best.delivery_days ? `${best.delivery_days} days` : undefined)

    return NextResponse.json({
      serviceable: true,
      eta,
      courier: best.courier_name || undefined,
    })
  } catch (error) {
    console.error('Shiprocket serviceability check failed:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { serviceable: false, message: 'Delivery check is temporarily unavailable. Please try again later.' },
      { status: 502 }
    )
  }
}
