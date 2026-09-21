import { NextRequest, NextResponse } from 'next/server'
import { getProducts, createProduct, createOrder, updateOrder } from '@/lib/woocommerce'

async function createSampleOrder(email: string, setDelivered: boolean) {
  let products = await getProducts({ per_page: 1 })
  let product = products[0]

  if (!product) {
    product = await createProduct({
      name: 'Sample Sports Shoe',
      type: 'simple',
      regular_price: '1499',
      status: 'publish',
    })
  }

  const customerEmail = email.toLowerCase().trim()
  const customerName = 'Test Customer'
  const address = '123 Sample Street'
  const city = 'Chennai'
  const state = 'Tamil Nadu'
  const postcode = '600001'
  const country = 'IN'

  const order = await createOrder({
    payment_method: 'cod',
    payment_method_title: 'Cash on Delivery',
    set_paid: false,
    customer_id: 0,
    billing: {
      first_name: customerName,
      last_name: '',
      address_1: address,
      city,
      state,
      postcode,
      country,
      email: customerEmail,
      phone: '9876543210',
    },
    shipping: {
      first_name: customerName,
      last_name: '',
      address_1: address,
      city,
      state,
      postcode,
      country,
    },
    line_items: [{ product_id: product.id, quantity: 1 }],
  })

  const trackingNumber = `ELT${Date.now().toString().slice(-8)}`
  const courier = 'Delhivery'
  const deliveryStatus = setDelivered ? 'delivered' : 'shipped'
  const status = setDelivered ? 'completed' : 'processing'

  await updateOrder(order.id, {
    status,
    meta_data: [
      { key: 'tracking_number', value: trackingNumber },
      { key: 'courier', value: courier },
      { key: 'delivery_status', value: deliveryStatus },
    ],
  })

  return {
    success: true,
    orderId: order.id,
    email: customerEmail,
    trackingNumber,
    courier,
    deliveryStatus,
    status,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || 'elitesportselaiyur@gmail.com'
    const setDelivered = searchParams.get('delivered') === 'true'
    const result = await createSampleOrder(email, setDelivered)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Seed order error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create sample order' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email = 'elitesportselaiyur@gmail.com', setDelivered = false } = (await req.json()) as {
      email?: string
      setDelivered?: boolean
    }
    const result = await createSampleOrder(email, setDelivered)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Seed order error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create sample order' }, { status: 500 })
  }
}
