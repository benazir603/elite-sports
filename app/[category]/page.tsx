import type { Metadata } from 'next'
import CollectionPage from '../components/CollectionPage'
import { PARENT_CATEGORY_SLUGS, SUBCATEGORIES } from '@/lib/categories'
import { SITE_URL } from '@/lib/site'

interface PageProps {
  params: Promise<{ category: string }>
}

function categoryTitle(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function generateStaticParams() {
  return Array.from(
    new Set([...PARENT_CATEGORY_SLUGS, ...Object.keys(SUBCATEGORIES)])
  ).map((category) => ({ category }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const title = categoryTitle(category)
  const subs = (SUBCATEGORIES[category] || []).map((s) => s.name.toLowerCase())
  return {
    title: `${title} Equipment & Accessories Online`,
    description: `Shop ${title.toLowerCase()} equipment online at Elite Sports Chennai${
      subs.length ? ` — ${subs.slice(0, 5).join(', ')} and more` : ''
    }. Genuine products, delivery across India.`,
    keywords: [
      `${title.toLowerCase()} equipment online`,
      `buy ${title.toLowerCase()} online India`,
      `${title.toLowerCase()} shop Chennai`,
      ...subs.map((s) => `${s} online`),
      'Elite Sports',
    ],
    alternates: { canonical: `${SITE_URL}/${category}` },
    openGraph: {
      title: `${title} Equipment & Accessories Online | Elite Sports`,
      description: `Shop ${title.toLowerCase()} equipment at Elite Sports Chennai. Delivery across India.`,
      url: `${SITE_URL}/${category}`,
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  return <CollectionPage category={category} />
}
