'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'

interface WishlistItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('elite-wishlist') : null
    if (saved) {
      try { setItems(JSON.parse(saved)) } catch {}
    }
  }, [])

  function removeItem(id: number) {
    const next = items.filter((i) => i.id !== id)
    setItems(next)
    localStorage.setItem('elite-wishlist', JSON.stringify(next))
  }

  function formatMoney(amount: number) {
    return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Wishlist</h1>

          {items.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-lg">Your wishlist is empty.</p>
              <a
                href="/"
                className="inline-block mt-4 bg-black hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full transition"
              >
                Continue Shopping
              </a>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition"
                >
                  <div className="h-56 bg-gray-50 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/600x600/f5f5f5/333333?text=${encodeURIComponent(item.name)}`
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase">{item.brand}</p>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="font-bold text-red-600">{formatMoney(item.price)}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-3 w-full border border-gray-300 hover:border-red-600 hover:text-red-600 text-sm font-bold py-2 rounded-full transition"
                    >
                      Remove
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
