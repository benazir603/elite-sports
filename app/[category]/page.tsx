import CollectionPage from '../components/CollectionPage'

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return [
    { category: 'badminton' },
    { category: 'cricket' },
    { category: 'tennis' },
    { category: 'pickleball' },
    { category: 'shoes' },
    { category: 'squash' },
    { category: 'swimming' },
    { category: 'other-sports' },
    { category: 'apparels' },
    { category: 'accessories' },
    { category: 'sports-equipments' },
  ]
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  return <CollectionPage category={category} />
}
