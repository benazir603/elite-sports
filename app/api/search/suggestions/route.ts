import { NextRequest, NextResponse } from 'next/server'
import { getAllProducts, type WooCommerceProduct } from '@/lib/woocommerce'

const CACHE_TTL = 5 * 60 * 1000
let cache: { data: WooCommerceProduct[]; at: number } | null = null

async function loadProducts() {
  if (cache && Date.now() - cache.at < CACHE_TTL) return cache.data
  const data = await getAllProducts()
  cache = { data, at: Date.now() }
  return data
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim().toLowerCase() || ''
  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const products = await loadProducts()
    const tokens = query.split(/\s+/).filter(Boolean)

    const suggestions = products
      .map((product) => {
        const searchable = `${product.name} ${product.sku || ''} ${product.categories
          .map((category) => category.name)
          .join(' ')}`.toLowerCase()
        if (!tokens.every((token) => searchable.includes(token))) return null

        const name = product.name.toLowerCase()
        let score = 0
        if (name.startsWith(query)) score += 50
        else if (name.includes(query)) score += 25
        return { product, score }
      })
      .filter((entry): entry is { product: WooCommerceProduct; score: number } => entry !== null)
      .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
      .slice(0, 8)
      .map(({ product }) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price) || Number(product.regular_price) || 0,
        regularPrice: Number(product.regular_price) || 0,
        image: product.images[0]?.src || '',
        url: `/product/${product.id}`,
      }))

    return NextResponse.json({ suggestions })
  } catch {
    return NextResponse.json({ suggestions: [] })
  }
}
