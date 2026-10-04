import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { findCustomerByEmail, getCustomerById, updateCustomer } from '@/lib/woocommerce'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wooCustomerId = (session.user as any)?.wooCustomerId
    let customerId: number | null = null

    if (typeof wooCustomerId === 'number') {
      customerId = wooCustomerId
    } else {
      const customer = await findCustomerByEmail(session.user.email)
      if (customer) customerId = customer.id
    }

    if (!customerId) {
      return NextResponse.json({ customer: null })
    }

    const customer = await getCustomerById(customerId)
    if (!customer) {
      return NextResponse.json({ customer: null })
    }

    return NextResponse.json({
      customer: {
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        billing: customer.billing,
        shipping: customer.shipping,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch account' }, { status: 500 })
  }
}

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const address = {
      first_name: clean(body.first_name, 100),
      last_name: clean(body.last_name, 100),
      address_1: clean(body.address_1, 200),
      address_2: clean(body.address_2, 200),
      city: clean(body.city, 100),
      state: clean(body.state, 100),
      postcode: clean(body.postcode, 20),
      country: clean(body.country, 2) || 'IN',
      phone: clean(body.phone, 20),
      email: session.user.email,
    }

    if (!address.first_name || !address.address_1 || !address.city || !address.state || !address.postcode) {
      return NextResponse.json({ error: 'Name, address, city, state and pincode are required' }, { status: 400 })
    }

    const wooCustomerId = (session.user as any)?.wooCustomerId
    let customerId: number | null = typeof wooCustomerId === 'number' ? wooCustomerId : null

    if (!customerId) {
      const customer = await findCustomerByEmail(session.user.email)
      if (customer) customerId = customer.id
    }

    if (!customerId) {
      return NextResponse.json({ error: 'Customer account not found' }, { status: 404 })
    }

    await updateCustomer(customerId, { billing: address, shipping: address })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save address' }, { status: 500 })
  }
}
