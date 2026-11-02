import { cache } from 'react'
import { getAllProducts, getCategories, type WooCommerceCategory, type WooCommerceProduct } from './woocommerce'

export interface MenuCategory {
  id: number
  name: string
  slug: string
  children: MenuCategory[]
}

const HIDDEN_SLUGS = new Set(['uncategorized'])

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

async function getAllCategories() {
  const categories: WooCommerceCategory[] = []
  for (let page = 1; ; page += 1) {
    const batch = await getCategories({ per_page: 100, page, _fields: 'id,name,slug,parent,menu_order' })
    categories.push(...batch)
    if (batch.length < 100) return categories
  }
}

/** WooCommerce category hierarchy, pruned to categories that contain published products. */
const getCatalog = cache(async () => {
  const [categories, products] = await Promise.all([getAllCategories(), getAllProducts()])
  const byParent = new Map<number, WooCommerceCategory[]>()
  for (const category of categories) {
    const siblings = byParent.get(category.parent) ?? []
    siblings.push(category)
    byParent.set(category.parent, siblings)
  }
  const productCategoryIds = products.map((product) => new Set(product.categories.map((category) => category.id)))

  function build(parentId: number): MenuCategory[] {
    return (byParent.get(parentId) ?? [])
      .filter((category) => !HIDDEN_SLUGS.has(category.slug))
      .sort((a, b) => (a.menu_order ?? 0) - (b.menu_order ?? 0) || a.name.localeCompare(b.name))
      .map((category) => ({
        id: category.id,
        name: decodeEntities(category.name),
        slug: category.slug,
        children: build(category.id),
      }))
      .filter((node) => {
        const ids = collectIds(node)
        return productCategoryIds.some((productIds) => ids.some((id) => productIds.has(id)))
      })
  }

  return { menu: build(0), products }
})

function collectIds(node: MenuCategory): number[] {
  return [node.id, ...node.children.flatMap(collectIds)]
}

export async function getMenu(): Promise<MenuCategory[]> {
  return (await getCatalog()).menu
}

/** Products assigned to the category or any of its subcategories, matched by category ID. */
export async function getCategoryProducts(node: MenuCategory): Promise<WooCommerceProduct[]> {
  const ids = new Set(collectIds(node))
  const { products } = await getCatalog()
  return products.filter((product) => product.categories.some((category) => ids.has(category.id)))
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')
const tokens = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((token) => (token.length > 3 ? token.replace(/s$/, '') : token))

/**
 * Finds a category by URL segment. Exact slug matches win; otherwise legacy URLs
 * (e.g. /volleyball, /badminton/rackets) resolve to the single closest category.
 */
export function matchCategory(nodes: MenuCategory[], segment: string, parent?: MenuCategory): MenuCategory | undefined {
  const slug = segment.trim().toLowerCase()
  const exact = nodes.find((node) => node.slug === slug)
  if (exact) return exact

  const key = normalize(slug)
  const named = nodes.filter((node) => normalize(node.slug) === key || normalize(node.name) === key)
  if (named.length === 1) return named[0]

  const ignored = new Set(parent ? tokens(`${parent.slug} ${parent.name}`) : [])
  const wanted = tokens(slug).filter((token) => !ignored.has(token))
  if (wanted.length === 0) return undefined
  const candidates = nodes
    .map((node) => ({ node, have: new Set(tokens(`${node.slug} ${node.name}`).filter((token) => !ignored.has(token))) }))
    .filter(({ have }) => wanted.every((token) => have.has(token)))
    .sort((a, b) => a.have.size - b.have.size)
  if (candidates.length === 1 || (candidates.length > 1 && candidates[0].have.size < candidates[1].have.size)) {
    return candidates[0].node
  }
  return undefined
}
