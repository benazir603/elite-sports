'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Header from './Header'
import { useCart } from './CartProvider'

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

interface WooCommerceProduct {
  id: number
  name: string
  slug: string
  price: string
  regular_price: string
  sale_price: string
  short_description: string
  description: string
  images: { id: number; src: string; alt: string }[]
  categories: { id: number; name: string; slug: string }[]
}

interface CollectionPageProps {
  category: string
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

const subCategories: Record<string, string[]> = {
  cricket: ['Bats / Balls', 'Batting gloves', 'Pads', 'Helmet', 'Guards', 'Cricket accessories'],
  football: ['Footballs', 'Studs', 'Shin Guards', 'Goalkeeper Gloves', 'Accessories'],
  basketball: ['Balls', 'Accessories'],
  'carrom-chess': ['Carrom Boards', 'Coins & Strikers', 'Chess Boards'],
  'table-tennis': ['Bats', 'Balls', 'Rubbers', 'Accessories'],
  fitness: ['Dumbbells', 'Kettlebells', 'Resistance Bands', 'Yoga Mats', 'Skipping Ropes', 'Fitness Accessories'],
  volleyball: ['Balls', 'Nets', 'Accessories'],
  'sports-footwear-apparel': ['Non-Marking Shoes', 'Running Shoes', 'Sportswear', 'Gym Wear'],
  swimming: ['Costumes', 'Caps', 'Goggles', 'Accessories'],
  'other-items': ['Sports Trophies & Medals', 'School Sports Equipment', 'Sports Accessories'],
  badminton: ['Rackets', 'Shuttlecocks', 'Strings & Gutting', 'Grip', 'Shoes', 'Accessories'],
}

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
    brand: woo.categories[0]?.name || 'Elite',
    category: fallbackCategory,
    price,
    originalPrice: regularPrice,
    image: firstImage,
    images: woo.images.map((img) => img.src),
    shortDescription: woo.short_description || '',
  }
}

export default function CollectionPage({ category }: CollectionPageProps) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name' | 'brand'>('price-asc')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const { addToCart: addToCartContext } = useCart()

  useEffect(() => {
    setSelectedImageIndex(0)
    setZoom(1)
  }, [selectedProduct])

  const currentProductImages = useMemo(() => {
    if (!selectedProduct) return []
    if (selectedProduct.images.length > 0) return selectedProduct.images.filter(Boolean)
    return selectedProduct.image ? [selectedProduct.image] : []
  }, [selectedProduct])
  const currentImage = currentProductImages[selectedImageIndex] || 'https://placehold.co/400x400/f5f5f5/333333.png?text=No+Image'

  useEffect(() => {
    setLoading(true)
    fetch(`/api/products?category=${encodeURIComponent(category)}`)
      .then((res) => res.json())
      .then((data: WooCommerceProduct[] | { error: string }) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data.map((item) => mapWooToProduct(item, category)))
        } else {
          setProducts(localProducts.filter((p) => p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === category))
        }
      })
      .catch(() => {
        setProducts(localProducts.filter((p) => p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === category))
      })
      .finally(() => setLoading(false))
  }, [category])

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), [products])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand))
    }

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
      if (sortBy === 'brand') return a.brand.localeCompare(b.brand)
      return 0
    })

    return result
  }, [selectedBrands, selectedPrice, sortBy, products])

  const title = category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  function addToCart(product: Product) {
    addToCartContext({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: getProductImage(product, category),
    })
  }

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  function clearFilters() {
    setSelectedBrands([])
    setSelectedPrice(null)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {subCategories[category] && (
          <div className="border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-wrap gap-2">
                {subCategories[category].map((sub) => (
                  <a
                    key={sub}
                    href={`#${sub.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="px-4 py-2 bg-gray-100 hover:bg-red-600 hover:text-white text-sm font-semibold rounded-full transition"
                  >
                    {sub}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar filters */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <h2 className="font-bold text-sm uppercase tracking-wide">Filters</h2>
                  {(selectedBrands.length > 0 || selectedPrice) && (
                    <button onClick={clearFilters} className="text-xs text-red-600 font-semibold hover:underline">
                      Clear all
                    </button>
                  )}
                </div>

                <div className="mb-6">
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

                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-3">Brand</h3>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-4 h-4 accent-red-600"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-red-600 transition">{brand}</span>
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
                  <option value="brand">Brand</option>
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
                      <div className="relative overflow-hidden aspect-square bg-gray-50">
                        <Link href={`/product/${product.id}`} className="block w-full h-full">
                          <img
                            src={getProductImage(product, category)}
                            alt={product.name}
                            className="w-full h-full object-contain transition duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = `https://placehold.co/600x600/f5f5f5/333333.png?text=${encodeURIComponent(product.name)}`
                            }}
                          />
                        </Link>
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
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{product.brand}</p>
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
          className="fixed inset-0 z-[70] bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedProduct(null) }}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {currentProductImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((prev) => (prev === 0 ? currentProductImages.length - 1 : prev - 1)) }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                aria-label="Previous image"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((prev) => (prev === currentProductImages.length - 1 ? 0 : prev + 1)) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                aria-label="Next image"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}

          <img
            src={currentImage}
            alt={selectedProduct.name}
            className="max-w-full max-h-[80vh] object-contain transition-transform duration-300"
            style={{ transform: `scale(${zoom})` }}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/f5f5f5/333333.png?text=No+Image' }}
          />

          <div className="flex items-center gap-4 mt-6">
            {currentProductImages.length > 1 && (
              <span className="text-sm text-white/80 font-medium">
                {selectedImageIndex + 1} / {currentProductImages.length}
              </span>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(0.5, z - 0.25)) }}
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full font-bold"
                aria-label="Zoom out"
              >
                -
              </button>
              <span className="text-sm font-medium w-12 text-center text-white">{Math.round(zoom * 100)}%</span>
              <button
                onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(3, z + 0.25)) }}
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full font-bold"
                aria-label="Zoom in"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
