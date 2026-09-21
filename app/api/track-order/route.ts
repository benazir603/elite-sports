import { NextRequest, NextResponse } from 'next/server'
import { getOrderById } from '@/lib/woocommerce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = Number(searchParams.get('id'))
    const email = searchParams.get('email')?.trim().toLowerCase()

    if (!id || !email) {
      return NextResponse.json({ error: 'Order ID and email are required' }, { status: 400 })
    }

    const order = await getOrderById(id)
    if (!order || order.billing?.email?.toLowerCase() !== email) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const meta = Object.fromEntries((order.meta_data || []).map((m) => [m.key, m.value]))

    return NextResponse.json({
      id: order.id,
      status: order.status,
      total: order.total,
      date_created: order.date_created,
      line_items: order.line_items,
      tracking_number: meta.tracking_number || '',
      courier: meta.courier || '',
      delivery_status: meta.delivery_status || '',
      shipping: order.shipping,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to track order' }, { status: 500 })
  }
}
