import { NextRequest, NextResponse } from 'next/server'
import { getProductById } from '@/lib/woocommerce'
import { calculateShipping, getShippingZone, itemWeightKg, ZONE_LABELS } from '@/lib/shipping'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const cart = Array.isArray(body.cart) ? body.cart : []
    const state = typeof body.state === 'string' ? body.state : ''
    const postcode = typeof body.postcode === 'string' ? body.postcode : ''

    if (cart.length === 0 || cart.length > 50) {
      return NextResponse.json({ error: 'Your cart is invalid' }, { status: 400 })
    }
    if (!state.trim() || !/^\d{6}$/.test(postcode.trim())) {
      return NextResponse.json({ error: 'Enter your state and 6-digit PIN code' }, { status: 400 })
    }

    let weightKg = 0
    for (const item of cart) {
      const productId = Number(item?.id)
      const quantity = Number(item?.qty)
      if (!Number.isSafeInteger(productId) || productId <= 0 || !Number.isSafeInteger(quantity) || quantity <= 0) {
        return NextResponse.json({ error: 'Your cart is invalid' }, { status: 400 })
      }
      const product = await getProductById(productId, true)
      weightKg += itemWeightKg(product?.weight) * quantity
    }

    const zone = getShippingZone(state, postcode)
    return NextResponse.json({
      zone,
      zoneLabel: ZONE_LABELS[zone],
      weightKg: Number(weightKg.toFixed(3)),
      charge: calculateShipping(weightKg, zone),
    })
  } catch (error) {
    console.error('Shipping quote error:', error)
    return NextResponse.json({ error: 'Could not calculate shipping' }, { status: 500 })
  }
}
