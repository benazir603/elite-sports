import { NextRequest, NextResponse } from 'next/server'
import { getProductsByCategorySlug, getProducts } from '@/lib/woocommerce'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  try {
    if (category) {
      const products = await getProductsByCategorySlug(category.split(',').filter(Boolean))
      return NextResponse.json(products)
    }
    const products = await getProducts({ per_page: 100 })
    return NextResponse.json(products)
  } catch (error: any) {
    console.error('[API /products] error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 })
  }
}
