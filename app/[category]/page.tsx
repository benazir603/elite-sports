import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import CollectionPage from '../components/CollectionPage'
import { getCategoryProducts, getMenu, matchCategory } from '@/lib/catalog'
import { SITE_URL } from '@/lib/site'

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  const menu = await getMenu().catch(() => [])
  return menu.map((category) => ({ category: category.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const node = matchCategory(await getMenu(), category)
  if (!node) return {}
  const title = node.name
  const subs = node.children.map((s) => s.name.toLowerCase())
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
    alternates: { canonical: `${SITE_URL}/${node.slug}` },
    openGraph: {
      title: `${title} Equipment & Accessories Online | Elite Sports`,
      description: `Shop ${title.toLowerCase()} equipment at Elite Sports Chennai. Delivery across India.`,
      url: `${SITE_URL}/${node.slug}`,
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  const node = matchCategory(await getMenu(), category)
  if (!node) notFound()
  if (node.slug !== category) redirect(`/${node.slug}`)

  const products = await getCategoryProducts(node)
  return (
    <CollectionPage
      key={node.slug}
      category={node.slug}
      categoryName={node.name}
      subLinks={node.children.map(({ name, slug }) => ({ name, slug }))}
      initialProducts={products}
    />
  )
}
