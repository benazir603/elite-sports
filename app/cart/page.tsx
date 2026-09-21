'use client'

import Header from '../components/Header'
import { useCart } from '../components/CartProvider'

export default function CartPage() {
  const { cart, updateQty, removeFromCart, cartTotal } = useCart()

  function formatMoney(amount: number) {
    return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Shopping Cart</h1>

          {cart.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-lg">Your cart is empty.</p>
              <a
                href="/"
                className="inline-block mt-4 bg-black hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full transition"
              >
                Continue Shopping
              </a>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 bg-white border border-gray-200 rounded-2xl p-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-contain rounded-lg bg-gray-50 p-2"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/600x600/f5f5f5/333333?text=${encodeURIComponent(item.name)}`
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-500 uppercase">{item.brand}</p>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="font-bold text-red-600">{formatMoney(item.price)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:border-red-600 hover:text-red-600"
                        >
                          -
                        </button>
                        <span className="font-bold">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:border-red-600 hover:text-red-600"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto text-sm text-red-600 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full lg:w-80">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h2 className="font-bold text-lg mb-4">Order Summary</h2>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold">{formatMoney(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-bold">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-black">
                    <span>Total</span>
                    <span>{formatMoney(cartTotal)}</span>
                  </div>
                  <a
                    href="/checkout"
                    className="block w-full mt-6 bg-black hover:bg-red-600 text-white font-bold py-3 rounded-full transition text-center"
                  >
                    Checkout
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
