import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getAllProducts } from '@/lib/woocommerce'
import { SUBCATEGORIES } from '@/lib/categories'

const CATEGORY_SLUGS = [
  'badminton',
  'cricket',
  'football',
  'basketball',
  'carrom-chess',
  'table-tennis',
  'fitness',
  'volleyball',
  'sports-footwear-apparel',
  'swimming',
  'other-items',
  'tennis',
  'pickleball',
  'shoes',
  'squash',
  'other-sports',
  'apparels',
  'accessories',
  'sports-equipments',
]

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
  const categoryEntries: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))
  const subCategoryEntries: MetadataRoute.Sitemap = Object.entries(SUBCATEGORIES).flatMap(
    ([parent, subs]) =>
      subs.map((sub) => ({
        url: `${SITE_URL}/${parent}/${sub.slug}`,
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
