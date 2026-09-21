import { NextRequest, NextResponse } from 'next/server'
import { badmintonProducts } from '../../data/badmintonProducts'
import { getCategories, createCategory, createProduct } from '@/lib/woocommerce'

export async function POST(request: NextRequest) {
  try {
    const categories = await getCategories({ per_page: 100 })
    let badminton = categories.find(
      (c) => c.name.toLowerCase() === 'badminton' || c.slug === 'badminton'
    )
    if (!badminton) {
      const created = await createCategory('Badminton', 'badminton')
      badminton = { ...created, parent: 0 }
    }

    const results: { id: number; name: string }[] = []
    for (const product of badmintonProducts) {
      const created = await createProduct({
        name: product.name,
        type: 'simple',
        regular_price: product.price.toFixed(2),
        categories: [{ id: badminton.id }],
        status: 'publish',
      })
      results.push({ id: created.id, name: created.name })
    }

    return NextResponse.json({ success: true, count: results.length, products: results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 })
  }
}
