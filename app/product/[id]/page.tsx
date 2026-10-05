import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/app/components/Header'
import PincodeCheck from '@/app/components/PincodeCheck'
import ProductImageGallery from '@/app/components/ProductImageGallery'
import ProductPurchaseOptions from '@/app/components/ProductPurchaseOptions'
import RelatedProducts from '@/app/components/RelatedProducts'
import TrackEvent from '@/app/components/TrackEvent'
import { SITE_URL } from '@/lib/site'
import { getProductById, getProductVariations } from '@/lib/woocommerce'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(Number(id))
  if (!product) return { title: 'Product not found - Elite Sports' }

  const description = product.short_description
    ? product.short_description.replace(/<[^>]+>/g, '').trim().slice(0, 160)
    : `Buy ${product.name} online at Elite Sports.`

  return {
    title: `${product.name} - Elite Sports`,
    description,
    alternates: { canonical: `${SITE_URL}/product/${product.id}` },
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      images: product.images[0]?.src ? [{ url: product.images[0].src }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProductById(Number(id))

  if (!product) {
    notFound()
  }

  const variations = product.type === 'variable' ? await getProductVariations(product.id) : []
  const images = product.images.map((img) => img.src)
  const image = images[0] || `https://placehold.co/600x600/f5f5f5/333333.png?text=${encodeURIComponent(product.name)}`
  const brand = product.categories[0]?.name || 'Elite'
  const price = Number(product.price) || Number(product.regular_price) || 0
  const regularPrice = Number(product.regular_price) || price
  const inStock = product.stock_status === 'instock'

  const bullets = product.short_description
    ? product.short_description
        .replace(/<[^>]+>/g, '')
        .split('.')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : []

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 lg:col-span-5">
              <div className="h-[50vh] md:h-[60vh] max-h-[500px]">
                <ProductImageGallery images={images} alt={product.name} />
              </div>
            </div>

            <div className="md:col-span-7 lg:col-span-7">
              <h1 className="text-2xl md:text-3xl font-medium text-gray-900 mb-2">{product.name}</h1>
              <p className="text-sm text-gray-500 mb-4">
                Brand: <span className="text-red-600 capitalize">{brand}</span>
              </p>

              {product.sku && <p className="text-xs text-gray-400 mb-4">SKU: {product.sku}</p>}

              <ProductPurchaseOptions
                product={{
                  id: product.id,
                  name: product.name,
                  brand,
                  price,
                  regularPrice,
                  image,
                  inStock,
                  stockQuantity: product.stock_quantity,
                }}
                attributes={product.attributes || []}
                variations={variations}
              />

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="font-bold text-gray-900 mb-1">Delivery</p>
                <p className="text-sm text-gray-600 mb-2">Delivered in 5-7 days across India. <Link href="/shipping" className="text-red-600 font-semibold hover:underline">Shipping info</Link></p>
                <p className="text-sm text-gray-600">Sold by <span className="font-medium text-gray-900">Elite Sports</span></p>
                <p className="text-sm text-gray-500 mt-2">
                  <Link href="/returns" className="text-red-600 font-semibold hover:underline">7-day easy returns</Link>. Secure transaction.
                </p>
                <PincodeCheck />
              </div>


              {bullets.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">About this item</h2>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1.5">
                    {bullets.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t pt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Product information</h2>
                <table className="w-full text-sm text-left text-gray-600">
                  <tbody>
                    {product.sku && (
                      <tr className="border-b">
                        <th className="py-2 pr-4 font-medium text-gray-900 w-40">SKU</th>
                        <td className="py-2">{product.sku}</td>
                      </tr>
                    )}
                    <tr className="border-b">
                      <th className="py-2 pr-4 font-medium text-gray-900 w-40">Stock Status</th>
                      <td className="py-2">{inStock ? 'In stock' : 'Out of stock'}</td>
                    </tr>
                    {product.weight && (
                      <tr className="border-b">
                        <th className="py-2 pr-4 font-medium text-gray-900 w-40">Weight</th>
                        <td className="py-2">{product.weight} kg</td>
                      </tr>
                    )}
                    {product.dimensions?.length && (
                      <tr className="border-b">
                        <th className="py-2 pr-4 font-medium text-gray-900 w-40">Dimensions</th>
                        <td className="py-2">
                          {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} cm
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {product.description && (
                <div className="mt-8 border-t pt-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Product details</h2>
                  <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              )}
            </div>
          </div>
        </div>

        <RelatedProducts categoryId={product.categories[0]?.id} excludeId={product.id} />
      </main>
      <TrackEvent event="view_item" data={{ item_id: product.id, item_name: product.name, price, item_category: brand }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: images,
            description: product.short_description ? product.short_description.replace(/<[^>]+>/g, '').trim() : undefined,
            sku: product.sku || undefined,
            brand: { '@type': 'Brand', name: brand },
            offers: {
              '@type': 'Offer',
              url: `${SITE_URL}/product/${product.id}`,
              priceCurrency: 'INR',
              price,
              availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
          }),
        }}
      />
    </>
  )
}
