import Link from 'next/link'
import { getProducts, type WooCommerceProduct } from '@/lib/woocommerce'

function formatMoney(amount: number) {
  return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

interface RelatedProductsProps {
  categoryId?: number
  excludeId: number
}

export default async function RelatedProducts({ categoryId, excludeId }: RelatedProductsProps) {
  if (!categoryId) return null

  let related: WooCommerceProduct[] = []
  try {
    const products = await getProducts({ per_page: 9, category: categoryId })
    related = products.filter((product) => product.id !== excludeId).slice(0, 8)
  } catch {
    return null
  }

  if (related.length === 0) return null

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Related products</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {related.map((product) => {
          const brand = product.categories[0]?.name || 'Elite'
          const price = Number(product.price) || Number(product.regular_price) || 0
          const originalPrice = Number(product.regular_price) || price
          const image = product.images[0]?.src || `https://placehold.co/600x600/f5f5f5/333333.png?text=${encodeURIComponent(product.name)}`

          return (
            <div
              key={product.id}
              className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300"
            >
              <Link href={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-gray-50">
                <img
                  src={image}
                  alt={product.name}
                  className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </Link>
              <div className="p-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">{brand}</p>
                <Link href={`/product/${product.id}`}>
                  <h3 className="mb-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-gray-900 line-clamp-2 hover:underline">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-600">{formatMoney(price)}</span>
                  {originalPrice > price && <span className="text-xs text-gray-400 line-through">{formatMoney(originalPrice)}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
