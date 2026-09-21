'use client'

import { useCart } from './CartProvider'

function formatMoney(amount: number) {
  return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default function CartDrawer() {
  const { cart, cartCount, cartTotal, updateQty, removeFromCart, isCartDrawerOpen, closeCartDrawer } = useCart()

  if (!isCartDrawerOpen) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={closeCartDrawer}
      />
      <aside className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-xl">Your Cart ({cartCount})</h3>
          <button onClick={closeCartDrawer} className="p-2 hover:bg-gray-100 rounded-full transition" aria-label="Close cart">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
              <button
                onClick={closeCartDrawer}
                className="bg-black hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-contain rounded-lg bg-gray-100 p-1"
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/100x100/eeeeee/333333?text=${encodeURIComponent(item.name)}`
                  }}
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-500 uppercase">{item.brand}</p>
                  <h4 className="font-bold text-sm leading-tight mb-1">{item.name}</h4>
                  <p className="font-bold text-red-600">{formatMoney(item.price)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs hover:border-red-600 hover:text-red-600"
                    >
                      -
                    </button>
                    <span className="text-sm font-semibold">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs hover:border-red-600 hover:text-red-600"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-auto text-xs text-red-600 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatMoney(item.price * item.qty)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-black text-xl">{formatMoney(cartTotal)}</span>
            </div>
            <a
              href="/cart"
              onClick={closeCartDrawer}
              className="block w-full text-center bg-black hover:bg-red-600 text-white font-bold py-3.5 rounded-full transition mb-3"
            >
              View Cart
            </a>
            <a
              href="/checkout"
              onClick={closeCartDrawer}
              className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-full transition"
            >
              Checkout
            </a>
          </div>
        )}
      </aside>
    </div>
  )
}
