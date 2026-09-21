import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { findCustomerByEmail, getOrdersByCustomer } from '@/lib/woocommerce'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customer = await findCustomerByEmail(session.user.email)
    if (!customer) {
      return NextResponse.json({ orders: [] })
    }

    const orders = await getOrdersByCustomer(customer.id)
    return NextResponse.json({ orders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 })
  }
}
