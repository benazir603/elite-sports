import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/woocommerce'

export async function GET() {
  try {
    const categories = await getCategories({ per_page: 100, hide_empty: 'true' })
    return NextResponse.json(
      categories
        .filter((category) => (category.count || 0) > 0 && category.slug !== 'uncategorized')
        .map(({ id, name, slug, parent, count }) => ({ id, name, slug, parent, count }))
    )
  } catch (error) {
    console.error('Category fetch failed:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Categories are temporarily unavailable' }, { status: 502 })
  }
}
