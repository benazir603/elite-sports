import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getAllProducts } from '@/lib/woocommerce'
import { getMenu } from '@/lib/catalog'

const STATIC_ROUTES = [
  '',
  '/contact',
  '/support',
  '/shipping',
  '/returns',
  '/size-guide',
  '/privacy-policy',
  '/terms',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.7,
  }))
  const menu = await getMenu().catch(() => [])
  const categoryEntries: MetadataRoute.Sitemap = menu.map((category) => ({
    url: `${SITE_URL}/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))
  const subCategoryEntries: MetadataRoute.Sitemap = menu.flatMap((category) =>
    category.children.map((sub) => ({
      url: `${SITE_URL}/${category.slug}/${sub.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  )

  try {
    const products = await getAllProducts()
    const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE_URL}/product/${product.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
    return [...staticEntries, ...categoryEntries, ...subCategoryEntries, ...productEntries]
  } catch {
    return [...staticEntries, ...categoryEntries, ...subCategoryEntries]
  }
}
