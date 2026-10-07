import { NextRequest, NextResponse } from 'next/server'
import { getProductsByCategorySlug, getProducts } from '@/lib/woocommerce'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  try {
    if (category) {
      const slugs = category
        .split(',')
        .map((slug) => slug.trim().toLowerCase())
        .filter((slug) => /^[a-z0-9-]+$/.test(slug))
        .slice(0, 20)
      if (slugs.length === 0) return NextResponse.json([])
      const response = await getProductsByCategorySlug(slugs)
      return NextResponse.json(Array.isArray(response) ? response : [])
    }
    const products = await getProducts({ per_page: 100 })
    return NextResponse.json(products)
  } catch (error: unknown) {
    console.error('[API /products] error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch products'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
