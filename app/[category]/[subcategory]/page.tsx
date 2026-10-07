import type { Metadata } from 'next'
import CollectionPage from '../../components/CollectionPage'
import { PARENT_CATEGORY_SLUGS, SUBCATEGORIES, findSubCategory } from '@/lib/categories'
import { SITE_URL } from '@/lib/site'

interface PageProps {
  params: Promise<{ category: string; subcategory: string }>
}

function categoryTitle(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function generateStaticParams() {
  const parents = Array.from(
    new Set([...PARENT_CATEGORY_SLUGS, ...Object.keys(SUBCATEGORIES)])
  )
  return parents.flatMap((category) =>
    (SUBCATEGORIES[category] || []).map((sub) => ({
      category,
      subcategory: sub.slug,
    }))
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, subcategory } = await params
  const catTitle = categoryTitle(category)
  const sub = findSubCategory(category, subcategory)
  const subTitle = sub ? sub.name : categoryTitle(subcategory)
  const url = `${SITE_URL}/${category}/${subcategory}`
  return {
    title: `${subTitle} — ${catTitle} Online`,
    description: `Buy ${subTitle.toLowerCase()} online at Elite Sports Chennai. Genuine ${catTitle.toLowerCase()} gear with delivery across India.`,
    keywords: [
      `${subTitle.toLowerCase()} online`,
      `buy ${subTitle.toLowerCase()} India`,
      `${catTitle.toLowerCase()} ${subTitle.toLowerCase()}`,
      `${subTitle.toLowerCase()} Chennai`,
      `${catTitle.toLowerCase()} equipment`,
      'Elite Sports',
    ],
    alternates: { canonical: url },
    openGraph: {
      title: `${subTitle} — ${catTitle} Online | Elite Sports`,
      description: `Buy ${subTitle.toLowerCase()} at Elite Sports Chennai. Delivery across India.`,
      url,
    },
  }
}

export default async function SubCategoryPage({ params }: PageProps) {
  const { category, subcategory } = await params
  return <CollectionPage key={`${category}:${subcategory}`} category={category} subcategory={subcategory} />
}
