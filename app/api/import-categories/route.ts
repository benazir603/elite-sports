import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { getCategories, createCategory } from '@/lib/woocommerce'

interface CatalogRow {
  Catageroy?: string
  'Item Name'?: string
  Type?: string
}

function normalizeName(name: string | undefined): string {
  if (!name) return ''
  return name.trim().replace(/\s+/g, ' ')
}

function normalizeForMatch(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ' ').trim()
}

export async function POST() {
  try {
    const raw = await readFile('catalog.json', 'utf-8')
    const rows = JSON.parse(raw) as CatalogRow[]

    // Collect unique categories and their types
    const groups = new Map<string, Set<string>>()
    for (const row of rows) {
      const cat = normalizeName(row.Catageroy)
      const type = normalizeName(row.Type)
      if (!cat) continue
      if (!groups.has(cat)) groups.set(cat, new Set())
      if (type) groups.get(cat)!.add(type)
    }

    // Fetch existing categories
    const existing = await getCategories({ per_page: 100 })
    const existingByName = new Map(existing.map((c) => [normalizeForMatch(c.name), c]))

    const created: { parent: string; children: string[] }[] = []

    for (const [category, types] of groups) {
      let parentCat = existingByName.get(normalizeForMatch(category))

      if (!parentCat) {
        parentCat = await createCategory(category)
        existingByName.set(normalizeForMatch(parentCat.name), parentCat)
      }

      const children: string[] = []
      for (const type of types) {
        const childMatchName = normalizeForMatch(type)
        const childExists = Array.from(existingByName.values()).some(
          (c) => c.parent === parentCat!.id && normalizeForMatch(c.name) === childMatchName
        )
        if (!childExists) {
          const childSlug = `${parentCat.slug}-${type.toLowerCase().replace(/\s+/g, '-')}`
          await createCategory(type, childSlug, parentCat.id)
        }
        children.push(type)
      }

      created.push({ parent: category, children })
    }

    return NextResponse.json({
      success: true,
      totalCategories: groups.size,
      created,
    })
  } catch (error: any) {
    console.error('Import categories error:', error)
    return NextResponse.json({ error: error.message || 'Failed to import categories' }, { status: 500 })
  }
}
