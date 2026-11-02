import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import CollectionPage from '../../components/CollectionPage'
import { getCategoryProducts, getMenu, matchCategory } from '@/lib/catalog'
import { SITE_URL } from '@/lib/site'

interface PageProps {
  params: Promise<{ category: string; subcategory: string }>
}

async function resolve(category: string, subcategory: string) {
  const parent = matchCategory(await getMenu(), category)
  const child = parent ? matchCategory(parent.children, subcategory, parent) : undefined
  return { parent, child }
}

export async function generateStaticParams() {
  const menu = await getMenu().catch(() => [])
  return menu.flatMap((category) =>
    category.children.map((sub) => ({ category: category.slug, subcategory: sub.slug }))
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, subcategory } = await params
  const { parent, child } = await resolve(category, subcategory)
  if (!parent || !child) return {}
  const catTitle = parent.name
  const subTitle = child.name
  const url = `${SITE_URL}/${parent.slug}/${child.slug}`
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
  const { parent, child } = await resolve(category, subcategory)
  if (!parent) notFound()
  if (!child) redirect(`/${parent.slug}`)
  if (parent.slug !== category || child.slug !== subcategory) redirect(`/${parent.slug}/${child.slug}`)

  const products = await getCategoryProducts(child)
  return (
    <CollectionPage
      key={`${parent.slug}:${child.slug}`}
      category={parent.slug}
      categoryName={parent.name}
      subcategory={{ name: child.name, slug: child.slug }}
      subLinks={parent.children.map(({ name, slug }) => ({ name, slug }))}
      initialProducts={products}
    />
  )
}
