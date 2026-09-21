import { NextResponse } from 'next/server'
import { getCategories, updateCategory } from '@/lib/woocommerce'

export async function POST() {
  try {
    const categories = await getCategories({ per_page: 100 })
    const updated: { id: number; oldName: string; newName: string }[] = []

    for (const cat of categories) {
      const marker = ' - '
      const idx = cat.name.indexOf(marker)
      if (idx === -1) continue

      const parentName = cat.name.slice(0, idx).trim()
      const newName = cat.name.slice(idx + marker.length).trim()
      const parent = categories.find(
        (c) => c.parent === 0 && c.name.toLowerCase() === parentName.toLowerCase()
      )

      if (!parent) continue

      const newSlug = `${parent.slug}-${newName.toLowerCase().replace(/\s+/g, '-')}`

      await updateCategory(cat.id, { name: newName, slug: newSlug, parent: parent.id })
      updated.push({ id: cat.id, oldName: cat.name, newName })
    }

    return NextResponse.json({ success: true, updated })
  } catch (error: any) {
    console.error('Clean categories error:', error)
    return NextResponse.json({ error: error.message || 'Failed to clean categories' }, { status: 500 })
  }
}
