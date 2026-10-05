import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getAllProducts } from '@/lib/woocommerce'

const CATEGORY_SLUGS = [
  'badminton',
  'cricket',
  'tennis',
  'pickleball',
  'shoes',
  'squash',
  'swimming',
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
  const staticEntries: MetadataRoute.Sitemap = [...STATIC_ROUTES, ...CATEGORY_SLUGS].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.7,
  }))

  try {
    const products = await getAllProducts()
    const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE_URL}/product/${product.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
    return [...staticEntries, ...productEntries]
  } catch {
    return staticEntries
  }
}
