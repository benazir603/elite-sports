'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Header from './Header'
import { useCart } from './CartProvider'
import { getProductBrand, type WooCommerceProduct } from '@/lib/woocommerce'
import { SUBCATEGORIES, findSubCategory } from '@/lib/categories'

interface Product {
  id: number
  name: string
  brand: string
  category: string
  price: number
  originalPrice: number
  image: string
  images: string[]
  shortDescription?: string
}

interface CollectionPageProps {
  category: string
  subcategory?: string
  initialProducts?: WooCommerceProduct[]
}

const EMPTY_WOO_PRODUCTS: WooCommerceProduct[] = []

const priceRanges = [
  { label: 'Under ₹5,000', min: 0, max: 5000 },
  { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
  { label: '₹10,000 - ₹15,000', min: 10000, max: 15000 },
  { label: 'Over ₹15,000', min: 15000, max: Infinity },
]

function formatMoney(amount: number) {
  return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function getProductImage(product: Product, category: string) {
  if (product.image) return product.image
  const cat = category.replace(/-/g, ' ').toUpperCase()
  const text = encodeURIComponent(`${cat} ${product.brand}`)
  return `https://placehold.co/600x600/f5f5f5/111827.png?text=${text}`
}

function mapWooToProduct(woo: WooCommerceProduct, fallbackCategory: string): Product | null {
  if (!woo || !Number.isFinite(Number(woo.id)) || typeof woo.name !== 'string') return null
  const price = Number(woo.price) || 0
  const regularPrice = Number(woo.regular_price) || price
  const images = Array.isArray(woo.images)
    ? woo.images.map((image) => image?.src).filter((src): src is string => Boolean(src))
    : []
  return {
    id: Number(woo.id),
    name: woo.name,
    brand: getProductBrand({ ...woo, attributes: Array.isArray(woo.attributes) ? woo.attributes : [] }) || '',
    category: fallbackCategory,
    price,
    originalPrice: regularPrice,
    image: images[0] || '',
    images,
    shortDescription: typeof woo.short_description === 'string' ? woo.short_description : '',
  }
}

function mapWooProducts(products: WooCommerceProduct[], category: string): Product[] {
  return products
    .map((product) => mapWooToProduct(product, category))
    .filter((product): product is Product => product !== null)
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" role="status" aria-label="Loading products">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="product-shimmer aspect-square" />
          <div className="space-y-3 p-4">
            <div className="h-2.5 w-1/3 product-shimmer rounded-full" />
            <div className="space-y-2">
              <div className="h-3.5 w-full product-shimmer rounded-full" />
              <div className="h-3.5 w-3/4 product-shimmer rounded-full" />
            </div>
            <div className="h-4 w-2/5 product-shimmer rounded-full" />
            <div className="h-9 w-full product-shimmer rounded-full" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading products…</span>
    </div>
  )
}

export default function CollectionPage({ category, subcategory, initialProducts = EMPTY_WOO_PRODUCTS }: CollectionPageProps) {
  const activeSub = subcategory ? findSubCategory(category, subcategory) : undefined
  const subLinks = SUBCATEGORIES[category] || []
  const apiCategory = activeSub ? activeSub.wooSlugs.join(',') : category
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('price-asc')
  const [products, setProducts] = useState<Product[]>(() => mapWooProducts(initialProducts, category))
  const [loading, setLoading] = useState(initialProducts.length === 0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [cardImageIndex, setCardImageIndex] = useState<Record<number, number>>({})
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const { addToCart: addToCartContext } = useCart()

  function openQuickView(product: Product) {
    setSelectedImageIndex(0)
    setSelectedProduct(product)
  }

  const currentProductImages = useMemo(() => {
    if (!selectedProduct) return []
    if (selectedProduct.images.length > 0) return selectedProduct.images.filter(Boolean)
    return selectedProduct.image ? [selectedProduct.image] : []
  }, [selectedProduct])
  const currentImage = currentProductImages[selectedImageIndex] || 'https://placehold.co/400x400/f5f5f5/333333.png?text=No+Image'

  useEffect(() => {
    if (initialProducts.length > 0) return

    const controller = new AbortController()

    async function loadProducts() {
      try {
        const response = await fetch(`/api/products?category=${encodeURIComponent(apiCategory)}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Product request failed')
        const data: unknown = await response.json()
        const safeProducts = Array.isArray(data) ? data as WooCommerceProduct[] : []
        setProducts(mapWooProducts(safeProducts, category))
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setProducts([])
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadProducts()
    return () => controller.abort()
  }, [apiCategory, category, initialProducts.length])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (selectedPrice) {
      const range = priceRanges.find((r) => r.label === selectedPrice)
      if (range) {
        result = result.filter((p) => p.price >= range.min && p.price < range.max)
      }
    }

    result.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

    return result
  }, [selectedPrice, sortBy, products])

  const title = (activeSub ? activeSub.name : category.replace(/-/g, ' ')).replace(/\b\w/g, (c) => c.toUpperCase())

  function addToCart(product: Product) {
    addToCartContext({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: getProductImage(product, category),
    })
  }

  function clearFilters() {
    setSelectedPrice(null)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {subLinks.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/${category}`}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                    !activeSub ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-red-600 hover:text-white'
                  }`}
                >
                  All
                </Link>
                {subLinks.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={`/${category}/${sub.slug}`}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                      activeSub?.slug === sub.slug ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <span className="mx-1.5">/</span>
            {activeSub ? (
              <>
                <Link href={`/${category}`} className="hover:text-red-600">{category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</Link>
                <span className="mx-1.5">/</span>
                <span className="text-gray-900 font-semibold">{activeSub.name}</span>
              </>
            ) : (
              <span className="text-gray-900 font-semibold">{title}</span>
            )}
          </nav>
          <h1 className="text-2xl font-black uppercase tracking-tight mb-5">{title}</h1>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar filters */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between lg:mb-4 lg:pb-4 lg:border-b lg:border-gray-100">
                  <button
                    onClick={() => setMobileFiltersOpen((open) => !open)}
                    aria-expanded={mobileFiltersOpen}
                    className="flex items-center gap-2 font-bold text-sm uppercase tracking-wide lg:cursor-default lg:pointer-events-none"
                  >
                    <svg className="w-5 h-5 lg:hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Filters
                    {selectedPrice && <span className="w-2 h-2 rounded-full bg-red-600 lg:hidden" />}
                    <svg
                      className={`w-4 h-4 lg:hidden transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {selectedPrice && (
                    <button onClick={clearFilters} className="text-xs text-red-600 font-semibold hover:underline">
                      Clear all
                    </button>
                  )}
                </div>

                <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block mt-4 lg:mt-0 pt-4 lg:pt-0 border-t border-gray-100 lg:border-0`}>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-3">Price</h3>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="price"
                          checked={selectedPrice === range.label}
                          onChange={() => setSelectedPrice(range.label)}
                          className="w-4 h-4 accent-red-600"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-red-600 transition">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Product grid */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <p className="text-gray-500 text-sm">{filteredProducts.length} results</p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'price-asc' | 'price-desc' | 'name')}
                  className="px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-red-600"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>

              {loading ? (
                <ProductGridSkeleton />
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No products match your filters.</p>
                  <button onClick={clearFilters} className="mt-4 text-red-600 font-semibold hover:underline">
                    Clear filters
                  </button>
                </div>
              ) : (
                <Suspense fallback={<ProductGridSkeleton />}>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300 flex flex-col h-full"
                    >
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        <Link href={`/product/${product.id}`} className="block w-full h-full">
                          <img
                            src={
                              product.images.filter(Boolean)[cardImageIndex[product.id] || 0] ||
                              getProductImage(product, category)
                            }
                            alt={product.name}
                            className="w-full h-full object-contain transition-opacity duration-300 md:group-hover:opacity-0"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = `https://placehold.co/600x600/f5f5f5/333333.png?text=${encodeURIComponent(product.name)}`
                            }}
                          />
                          {product.images.filter(Boolean)[1] && (
                            <img
                              src={product.images.filter(Boolean)[1]}
                              alt={`${product.name} alternate view`}
                              className="absolute inset-0 hidden w-full h-full object-contain opacity-0 transition-opacity duration-300 md:block md:group-hover:opacity-100"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                        </Link>
                        {product.images.filter(Boolean).length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                setCardImageIndex((current) => {
                                  const total = product.images.filter(Boolean).length
                                  const index = current[product.id] || 0
                                  return { ...current, [product.id]: index === 0 ? total - 1 : index - 1 }
                                })
                              }
                              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white/90 hover:bg-white text-gray-700 rounded-full shadow transition md:hidden"
                              aria-label="Previous image"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button
                              onClick={() =>
                                setCardImageIndex((current) => {
                                  const total = product.images.filter(Boolean).length
                                  const index = current[product.id] || 0
                                  return { ...current, [product.id]: index === total - 1 ? 0 : index + 1 }
                                })
                              }
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white/90 hover:bg-white text-gray-700 rounded-full shadow transition md:hidden"
                              aria-label="Next image"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                            </button>
                          </>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
                          <button
                            onClick={() => openQuickView(product)}
                            className="bg-white text-black text-xs font-bold uppercase tracking-wide py-2 px-4 rounded-full hover:bg-gray-900 hover:text-white transition pointer-events-auto shadow"
                          >
                            Quick view
                          </button>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        {product.brand && <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{product.brand}</p>}
                        <Link href={`/product/${product.id}`} className="block">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-tight line-clamp-2 min-h-[2.5rem] hover:underline">{product.name}</h3>
                        </Link>
                        {product.shortDescription && (
                          <p className="text-xs text-gray-500 leading-snug line-clamp-2 mb-2">
                            {product.shortDescription.replace(/<\/?[^>]+>/g, '')}
                          </p>
                        )}
                        <div className="mt-auto">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-red-600">{formatMoney(product.price)}</span>
                            {product.originalPrice > product.price && (
                              <span className="text-xs text-gray-400 line-through">{formatMoney(product.originalPrice)}</span>
                            )}
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            className="mt-3 w-full bg-black hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wide py-2 rounded-full transition"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedProduct && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Quick view: ${selectedProduct.name}`}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 z-10 p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-full shadow transition"
              aria-label="Close quick view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="relative bg-gray-50 aspect-square">
                <img
                  src={currentImage}
                  alt={selectedProduct.name}
                  className="w-full h-full object-contain p-4"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/f5f5f5/333333.png?text=No+Image' }}
                />
                {currentProductImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? currentProductImages.length - 1 : prev - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow transition"
                      aria-label="Previous image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === currentProductImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow transition"
                      aria-label="Next image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <span className="absolute bottom-2 right-3 text-xs text-gray-500 font-medium">
                      {selectedImageIndex + 1} / {currentProductImages.length}
                    </span>
                  </>
                )}
              </div>

              {/* Details */}
              <div className="p-6 flex flex-col">
                {selectedProduct.brand && (
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{selectedProduct.brand}</p>
                )}
                <h3 className="text-lg font-semibold text-gray-900 leading-snug mb-3">{selectedProduct.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-bold text-red-600">{formatMoney(selectedProduct.price)}</span>
                  {selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-sm text-gray-400 line-through">{formatMoney(selectedProduct.originalPrice)}</span>
                  )}
                </div>
                {selectedProduct.shortDescription && (
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 mb-5">
                    {selectedProduct.shortDescription.replace(/<\/?[^>]+>/g, '')}
                  </p>
                )}
                <div className="mt-auto space-y-2">
                  <button
                    onClick={() => { addToCart(selectedProduct); setSelectedProduct(null) }}
                    className="w-full bg-black hover:bg-red-600 text-white text-sm font-bold uppercase tracking-wide py-3 rounded-full transition"
                  >
                    Add to Cart
                  </button>
                  <Link
                    href={`/product/${selectedProduct.id}`}
                    onClick={() => setSelectedProduct(null)}
                    className="block w-full text-center border border-gray-300 hover:border-red-600 text-gray-800 hover:text-red-600 text-sm font-bold uppercase tracking-wide py-3 rounded-full transition"
                  >
                    View full details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
