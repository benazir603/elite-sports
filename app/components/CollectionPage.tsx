'use client'

import { useEffect, useMemo, useState } from 'react'
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
}

const localProducts: Product[] = [
  { id: 1, name: 'Nike Air Zoom Pegasus 40', brand: 'Nike', category: 'Running', price: 140, originalPrice: 190, image: '', images: [] },
  { id: 2, name: 'Adidas Ultraboost Light', brand: 'Adidas', category: 'Running', price: 190, originalPrice: 240, image: '', images: [] },
  { id: 3, name: 'Jordan 1 Retro High OG', brand: 'Jordan', category: 'Lifestyle', price: 180, originalPrice: 230, image: '', images: [] },
  { id: 4, name: 'Under Armour Curry 10', brand: 'Under Armour', category: 'Basketball', price: 160, originalPrice: 210, image: '', images: [] },
  { id: 5, name: 'Puma RS-X Bold', brand: 'Puma', category: 'Lifestyle', price: 120, originalPrice: 160, image: '', images: [] },
  { id: 6, name: 'New Balance 990v6', brand: 'New Balance', category: 'Running', price: 200, originalPrice: 250, image: '', images: [] },
  { id: 7, name: 'Nike LeBron 20', brand: 'Nike', category: 'Basketball', price: 200, originalPrice: 260, image: '', images: [] },
  { id: 23, name: 'Basketball', brand: 'Spalding', category: 'Basketball', price: 120, originalPrice: 170, image: '', images: [] },
  { id: 24, name: 'Basketball Accessories', brand: 'Elite', category: 'Basketball', price: 80, originalPrice: 120, image: '', images: [] },
  { id: 8, name: 'Converse Chuck 70 Plus', brand: 'Converse', category: 'Lifestyle', price: 95, originalPrice: 120, image: '', images: [] },
  { id: 9, name: 'Adidas Adizero Adios Pro 3', brand: 'Adidas', category: 'Running', price: 230, originalPrice: 280, image: '', images: [] },
  { id: 10, name: 'Football', brand: 'Nike', category: 'Football', price: 150, originalPrice: 190, image: '', images: [] },
  { id: 19, name: 'Studs', brand: 'Adidas', category: 'Football', price: 120, originalPrice: 160, image: '', images: [] },
  { id: 20, name: 'Shin Guards', brand: 'Puma', category: 'Football', price: 80, originalPrice: 120, image: '', images: [] },
  { id: 21, name: 'Goalkeeper Gloves', brand: 'Reusch', category: 'Football', price: 250, originalPrice: 350, image: '', images: [] },
  { id: 22, name: 'Football Accessories', brand: 'Elite', category: 'Football', price: 50, originalPrice: 80, image: '', images: [] },
  { id: 25, name: 'Carrom Board', brand: 'Elite', category: 'Carrom & Chess', price: 2500, originalPrice: 3200, image: '', images: [] },
  { id: 26, name: 'Chess Board', brand: 'Elite', category: 'Carrom & Chess', price: 1200, originalPrice: 1600, image: '', images: [] },
  { id: 27, name: 'Coins & Strikers', brand: 'Elite', category: 'Carrom & Chess', price: 350, originalPrice: 500, image: '', images: [] },
  { id: 28, name: 'Table Tennis Bat', brand: 'Elite', category: 'Table Tennis', price: 1200, originalPrice: 1600, image: '', images: [] },
  { id: 29, name: 'Table Tennis Ball', brand: 'Elite', category: 'Table Tennis', price: 200, originalPrice: 300, image: '', images: [] },
  { id: 30, name: 'Table Tennis Rubbers', brand: 'Elite', category: 'Table Tennis', price: 800, originalPrice: 1100, image: '', images: [] },
  { id: 31, name: 'Table Tennis Accessories', brand: 'Elite', category: 'Table Tennis', price: 400, originalPrice: 600, image: '', images: [] },
  { id: 32, name: 'Dumbbells', brand: 'Elite', category: 'Fitness', price: 800, originalPrice: 1100, image: '', images: [] },
  { id: 33, name: 'Kettlebells', brand: 'Elite', category: 'Fitness', price: 1200, originalPrice: 1600, image: '', images: [] },
  { id: 34, name: 'Resistance Bands', brand: 'Elite', category: 'Fitness', price: 300, originalPrice: 450, image: '', images: [] },
  { id: 35, name: 'Yoga Mat', brand: 'Elite', category: 'Fitness', price: 600, originalPrice: 900, image: '', images: [] },
  { id: 36, name: 'Skipping Rope', brand: 'Elite', category: 'Fitness', price: 200, originalPrice: 300, image: '', images: [] },
  { id: 37, name: 'Fitness Accessories', brand: 'Elite', category: 'Fitness', price: 400, originalPrice: 600, image: '', images: [] },
  { id: 38, name: 'Volleyball', brand: 'Elite', category: 'Volleyball', price: 700, originalPrice: 950, image: '', images: [] },
  { id: 39, name: 'Volleyball Net', brand: 'Elite', category: 'Volleyball', price: 1500, originalPrice: 2000, image: '', images: [] },
  { id: 40, name: 'Volleyball Accessories', brand: 'Elite', category: 'Volleyball', price: 350, originalPrice: 500, image: '', images: [] },
  { id: 41, name: 'Non-Marking Shoes', brand: 'Elite', category: 'Sports Footwear & Apparel', price: 1200, originalPrice: 1700, image: '', images: [] },
  { id: 42, name: 'Running Shoes', brand: 'Nike', category: 'Sports Footwear & Apparel', price: 2500, originalPrice: 3200, image: '', images: [] },
  { id: 43, name: 'Sportswear', brand: 'Puma', category: 'Sports Footwear & Apparel', price: 1500, originalPrice: 2200, image: '', images: [] },
  { id: 44, name: 'Gym Wear', brand: 'Elite', category: 'Sports Footwear & Apparel', price: 1000, originalPrice: 1400, image: '', images: [] },
  { id: 45, name: 'Swimming Costume', brand: 'Elite', category: 'Swimming', price: 600, originalPrice: 900, image: '', images: [] },
  { id: 46, name: 'Swimming Cap', brand: 'Elite', category: 'Swimming', price: 150, originalPrice: 250, image: '', images: [] },
  { id: 47, name: 'Swimming Goggles', brand: 'Elite', category: 'Swimming', price: 350, originalPrice: 500, image: '', images: [] },
  { id: 48, name: 'Swimming Accessories', brand: 'Elite', category: 'Swimming', price: 250, originalPrice: 400, image: '', images: [] },
  { id: 11, name: 'Nike Zoom Metcon Turbo 2', brand: 'Nike', category: 'Training', price: 170, originalPrice: 220, image: '', images: [] },

  { id: 55, name: 'AXFORCE TIGER - 5U', brand: 'Elite', category: 'Badminton', price: 0, originalPrice: 0, image: '', images: [] },
  { id: 13, name: 'Cricket Bat', brand: 'Elite', category: 'Cricket', price: 2500, originalPrice: 3200, image: '', images: [] },
  { id: 14, name: 'Cricket Ball', brand: 'Elite', category: 'Cricket', price: 400, originalPrice: 600, image: '', images: [] },
  { id: 15, name: 'Cricket Pads', brand: 'Elite', category: 'Cricket', price: 1800, originalPrice: 2400, image: '', images: [] },
  { id: 16, name: 'Cricket Helmet', brand: 'Elite', category: 'Cricket', price: 2200, originalPrice: 2800, image: '', images: [] },
  { id: 17, name: 'Cricket Guard', brand: 'Elite', category: 'Cricket', price: 350, originalPrice: 500, image: '', images: [] },
  { id: 18, name: 'Cricket Accessories', brand: 'Elite', category: 'Cricket', price: 650, originalPrice: 900, image: '', images: [] },
].map((p) => ({
  ...p,
  image: `https://placehold.co/600x600/f5f5f5/111827.png?text=${encodeURIComponent(p.name)}`,
  images: [
    `https://placehold.co/400x400/f5f5f5/111827.png?text=${encodeURIComponent(p.name)}+1`,
    `https://placehold.co/400x400/f5f5f5/111827.png?text=${encodeURIComponent(p.name)}+2`,
    `https://placehold.co/400x400/f5f5f5/111827.png?text=${encodeURIComponent(p.name)}+3`,
  ],
}))

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

function mapWooToProduct(woo: WooCommerceProduct, fallbackCategory: string): Product {
  const price = Number(woo.price) || 0
  const regularPrice = Number(woo.regular_price) || price
  const firstImage = woo.images[0]?.src || ''
  return {
    id: woo.id,
    name: woo.name,
    brand: getProductBrand(woo) || '',
    category: fallbackCategory,
    price,
    originalPrice: regularPrice,
    image: firstImage,
    images: woo.images.map((img) => img.src),
    shortDescription: woo.short_description || '',
  }
}

export default function CollectionPage({ category, subcategory }: CollectionPageProps) {
  const activeSub = subcategory ? findSubCategory(category, subcategory) : undefined
  const subLinks = SUBCATEGORIES[category] || []
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('price-asc')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [cardImageIndex, setCardImageIndex] = useState<Record<number, number>>({})
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const { addToCart: addToCartContext } = useCart()

  useEffect(() => {
    setSelectedImageIndex(0)
  }, [selectedProduct])

  const currentProductImages = useMemo(() => {
    if (!selectedProduct) return []
    if (selectedProduct.images.length > 0) return selectedProduct.images.filter(Boolean)
    return selectedProduct.image ? [selectedProduct.image] : []
  }, [selectedProduct])
  const currentImage = currentProductImages[selectedImageIndex] || 'https://placehold.co/400x400/f5f5f5/333333.png?text=No+Image'

  useEffect(() => {
    setLoading(true)
    const apiCategory = activeSub ? activeSub.wooSlugs.join(',') : category
    const matchesLocal = (product: Product) => {
      if (product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') !== category) return false
      if (!activeSub) return true
      const keywords = activeSub.name
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter((w) => w.length > 2 && w !== 'and')
        .map((w) => w.replace(/s$/, ''))
      const haystack = `${product.name} ${product.category}`.toLowerCase()
      return keywords.length === 0 || keywords.some((k) => haystack.includes(k))
    }
    fetch(`/api/products?category=${encodeURIComponent(apiCategory)}`)
      .then((res) => res.json())
      .then((data: WooCommerceProduct[] | { error: string }) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data.map((item) => mapWooToProduct(item, category)))
        } else {
          setProducts(localProducts.filter(matchesLocal))
        }
      })
      .catch(() => {
        setProducts(localProducts.filter(matchesLocal))
      })
      .finally(() => setLoading(false))
  }, [category, subcategory])

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
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-red-600"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>

              {loading ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No products match your filters.</p>
                  <button onClick={clearFilters} className="mt-4 text-red-600 font-semibold hover:underline">
                    Clear filters
                  </button>
                </div>
              ) : (
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
                            className="w-full h-full object-contain transition duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = `https://placehold.co/600x600/f5f5f5/333333.png?text=${encodeURIComponent(product.name)}`
                            }}
                          />
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
                              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white/90 hover:bg-white text-gray-700 rounded-full shadow transition opacity-0 group-hover:opacity-100"
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
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white/90 hover:bg-white text-gray-700 rounded-full shadow transition opacity-0 group-hover:opacity-100"
                              aria-label="Next image"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                            </button>
                          </>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
                          <button
                            onClick={() => setSelectedProduct(product)}
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
                            <span className="text-xs text-gray-400 line-through">{formatMoney(product.originalPrice)}</span>
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
