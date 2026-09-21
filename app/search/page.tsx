'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '../components/Header'
import { useCart } from '../components/CartProvider'

interface Product {
  id: number
  name: string
  brand: string
  category: string
  price: number
  originalPrice: number
  image?: string
}

const products: Product[] = [
  { id: 1, name: 'Nike Air Zoom Pegasus 40', brand: 'Nike', category: 'Running', price: 140, originalPrice: 190 },
  { id: 2, name: 'Adidas Ultraboost Light', brand: 'Adidas', category: 'Running', price: 190, originalPrice: 240 },
  { id: 3, name: 'Jordan 1 Retro High OG', brand: 'Jordan', category: 'Lifestyle', price: 180, originalPrice: 230 },
  { id: 4, name: 'Under Armour Curry 10', brand: 'Under Armour', category: 'Basketball', price: 160, originalPrice: 210 },
  { id: 5, name: 'Puma RS-X Bold', brand: 'Puma', category: 'Lifestyle', price: 120, originalPrice: 160 },
  { id: 6, name: 'New Balance 990v6', brand: 'New Balance', category: 'Running', price: 200, originalPrice: 250 },
  { id: 7, name: 'Nike LeBron 20', brand: 'Nike', category: 'Basketball', price: 200, originalPrice: 260 },
  { id: 8, name: 'Converse Chuck 70 Plus', brand: 'Converse', category: 'Lifestyle', price: 95, originalPrice: 120 },
  { id: 9, name: 'Adidas Adizero Adios Pro 3', brand: 'Adidas', category: 'Running', price: 230, originalPrice: 280 },
  { id: 10, name: 'Puma Future Z 1.4', brand: 'Puma', category: 'Football', price: 150, originalPrice: 190 },
  { id: 11, name: 'Nike Zoom Metcon Turbo 2', brand: 'Nike', category: 'Training', price: 170, originalPrice: 220 },
  { id: 12, name: 'Asics Gel-Rocket 12', brand: 'Asics', category: 'Badminton', price: 130, originalPrice: 170 },
]

function formatMoney(amount: number) {
  return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function getProductImage(product: Product, query: string) {
  if (product.image) return product.image
  const text = encodeURIComponent(`${query.toUpperCase()} ${product.brand}`)
  return `https://placehold.co/600x600/f5f5f5/111827.png?text=${text}`
}

function SearchContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const { addToCart: addToCartContext } = useCart()

  const results = useMemo(() => {
    if (!q.trim()) return []
    const term = q.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    )
  }, [q])

  function addToCart(product: Product) {
    addToCartContext({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: getProductImage(product, q),
    })
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          {q.trim() === '' ? (
            <div className="text-center py-20 text-gray-500">Enter a search term above to find products.</div>
          ) : results.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-lg">No products found matching &quot;{q}&quot;.</p>
              <a
                href="/"
                className="inline-block mt-4 bg-black hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full transition"
              >
                Continue Shopping
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {results.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={getProductImage(product, q)}
                      alt={product.name}
                      className="w-full h-full object-contain transition duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/600x600/f5f5f5/333333.png?text=${encodeURIComponent(product.name)}`
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{product.brand}</p>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-tight line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
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
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<><Header /><main className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-500">Loading search...</p></main></>}>
      <SearchContent />
    </Suspense>
  )
}
