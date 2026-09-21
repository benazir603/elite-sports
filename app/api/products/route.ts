import { NextRequest, NextResponse } from 'next/server'
import { getProductsByCategorySlug, getProducts } from '@/lib/woocommerce'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  console.log('[API /products] category=', category)
  console.log('[API /products] WOOCOMMERCE_URL exists=', !!process.env.WOOCOMMERCE_URL)
  console.log('[API /products] WOOCOMMERCE_CONSUMER_KEY exists=', !!process.env.WOOCOMMERCE_CONSUMER_KEY)
  console.log('[API /products] WOOCOMMERCE_CONSUMER_SECRET exists=', !!process.env.WOOCOMMERCE_CONSUMER_SECRET)

  try {
    if (category) {
      const products = await getProductsByCategorySlug(category)
      console.log('[API /products] returned', products.length, 'products')
      return NextResponse.json(products)
    }
    const products = await getProducts({ per_page: 100 })
    console.log('[API /products] returned', products.length, 'products')
    return NextResponse.json(products)
  } catch (error: any) {
    console.error('[API /products] error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 })
  }
}
