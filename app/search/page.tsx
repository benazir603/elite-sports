import Link from 'next/link'
import Header from '../components/Header'
import AddToCartButton from '../components/AddToCartButton'
import { getAllProducts } from '@/lib/woocommerce'

function formatMoney(amount: number) {
  return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function searchProducts(products: Awaited<ReturnType<typeof getAllProducts>>, query: string) {
  const normalizedQuery = normalize(query)
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean)

  return products
    .map((product) => {
      const name = normalize(product.name)
      const sku = normalize(product.sku || '')
      const categories = normalize(product.categories.map((category) => category.name).join(' '))
      const brands = normalize((product.brands || []).map((brand) => brand.name).join(' '))
      const searchable = `${name} ${sku} ${categories} ${brands}`
      if (!tokens.every((token) => searchable.includes(token))) return null

      let score = 0
      if (name === normalizedQuery) score += 100
      else if (name.startsWith(normalizedQuery)) score += 75
      else if (name.includes(normalizedQuery)) score += 50
      if (sku === normalizedQuery) score += 40
      if (brands.includes(normalizedQuery)) score += 25
      if (categories.split(' ').includes(normalizedQuery)) score += 20
      return { product, score }
    })
    .filter((result): result is { product: Awaited<ReturnType<typeof getAllProducts>>[number]; score: number } => result !== null)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .map(({ product }) => product)
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = String(Array.isArray(q) ? q[0] : q || '').trim()
  let products: Awaited<ReturnType<typeof getAllProducts>> = []
  let searchError = false
  if (query) {
    try {
      products = searchProducts(await getAllProducts(), query)
    } catch (error) {
      searchError = true
      console.error('Product search failed:', error)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          {query === '' ? (
            <div className="text-center py-20 text-gray-500">Enter a search term above to find products.</div>
          ) : searchError ? (
            <div className="text-center py-20 bg-red-50 rounded-2xl">
              <p className="font-semibold text-red-700">Product search is temporarily unavailable.</p>
              <p className="mt-2 text-sm text-gray-600">Please try again after the store connection is restored.</p>
              <Link href="/" className="inline-block mt-4 bg-black hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full transition">Continue Shopping</Link>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-lg">No products found matching &quot;{query}&quot;.</p>
              <Link
                href="/"
                className="inline-block mt-4 bg-black hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full transition"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-6 text-gray-600">
                Showing <span className="font-bold text-gray-900">{products.length}</span> result{products.length === 1 ? '' : 's'} for <span className="font-bold text-gray-900">&quot;{query}&quot;</span>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => {
                  const brand = product.categories[0]?.name || 'Elite'
                  const price = Number(product.price) || Number(product.regular_price) || 0
                  const originalPrice = Number(product.regular_price) || price
                  const image = product.images[0]?.src || `https://placehold.co/600x600/f5f5f5/333333.png?text=${encodeURIComponent(product.name)}`
                  const isVariable = product.type === 'variable'

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
                          <h3 className="mb-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-gray-900 line-clamp-2 hover:underline">{product.name}</h3>
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-600">{formatMoney(price)}</span>
                          {originalPrice > price && <span className="text-xs text-gray-400 line-through">{formatMoney(originalPrice)}</span>}
                        </div>
                        {isVariable ? (
                          <Link
                            href={`/product/${product.id}`}
                            className="mt-3 block w-full rounded-full bg-black py-2 text-center text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-600"
                          >
                            Select Options
                          </Link>
                        ) : (
                          <AddToCartButton
                            product={{ id: product.id, name: product.name, brand, price, image }}
                            className="mt-3 w-full rounded-full bg-black py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-600"
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
