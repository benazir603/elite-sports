import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getOrderById } from '@/lib/woocommerce'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const sessionEmail = session?.user?.email?.trim().toLowerCase()
    if (!sessionEmail) {
      return NextResponse.json({ error: 'Please sign in to track your order' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = Number(searchParams.get('id'))

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const order = await getOrderById(id)
    if (!order || order.billing?.email?.toLowerCase() !== sessionEmail) {
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
