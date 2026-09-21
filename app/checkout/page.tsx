'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Header from '../components/Header'
import { useCart } from '../components/CartProvider'

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postcode: '',
    country: 'IN',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { data: session, status } = useSession()

  useEffect(() => {
    if (session?.user) {
      const fullName = session.user.name || ''
      const [first, ...rest] = fullName.split(' ')
      const last = rest.join(' ')
      setForm((prev) => ({
        ...prev,
        firstName: prev.firstName || first || '',
        lastName: prev.lastName || last || '',
        email: prev.email || session.user?.email || '',
      }))
    }
  }, [session])

  function formatMoney(amount: number) {
    return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (cart.length === 0) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customer: form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Order failed')
      await openRazorpayCheckout(data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('razorpay-script')) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.id = 'razorpay-script'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout'))
      document.body.appendChild(script)
    })
  }

  async function openRazorpayCheckout(data: {
    key: string
    amount: number
    currency: string
    razorpayOrderId: string
    orderId: number
  }) {
    await loadRazorpayScript()
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: 'Elite Sports',
      description: `Order #${data.orderId}`,
      order_id: data.razorpayOrderId,
      prefill: {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        contact: form.phone,
      },
      handler: async (response: any) => {
        try {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId: data.orderId,
            }),
          })
          const verifyData = await verifyRes.json()
          if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed')
          clearCart()
          window.location.href = `/order-success?orderId=${data.orderId}`
        } catch (err: any) {
          setError(err.message || 'Payment verification failed')
        }
      },
      theme: { color: '#dc2626' },
      modal: {
        ondismiss: () => setLoading(false),
      },
    }

    const razorpay = new (window as any).Razorpay(options)
    razorpay.open()
  }

  if (status === 'loading') {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <p className="text-gray-500">Loading...</p>
        </main>
      </>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-black mb-4">Sign in to checkout</h1>
            <p className="text-gray-600 mb-6">Please sign in to continue placing your order.</p>
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/checkout' })}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:border-red-600 text-gray-700 font-bold py-3 rounded-full transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
            <p className="mt-6 text-sm text-gray-500">
              <a href="/cart" className="text-red-600 font-semibold hover:underline">Return to cart</a>
            </p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h1 className="text-2xl font-black uppercase tracking-tight mb-6">Checkout</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  value={form.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="First name"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-red-600"
                />
                <input
                  required
                  type="text"
                  value={form.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="Last name"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-red-600"
              />
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="Phone"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-red-600"
              />
              <textarea
                required
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Address"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-red-600"
                rows={3}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="City"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-red-600"
                />
                <input
                  required
                  type="text"
                  value={form.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  placeholder="State"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  value={form.postcode}
                  onChange={(e) => updateField('postcode', e.target.value)}
                  placeholder="Postcode"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-red-600"
                />
                <input
                  required
                  type="text"
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  placeholder="Country"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>
              {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="w-full bg-black hover:bg-red-600 text-white font-bold py-3 rounded-full transition disabled:opacity-50"
              >
                {loading ? 'Placing order...' : 'Proceed to Payment'}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm h-fit">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500">Your cart is empty. Add some products before checkout.</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 mb-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-contain rounded-lg bg-gray-50 p-1"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/100x100/eeeeee/333333?text=${encodeURIComponent(item.name)}`
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-500 text-sm">Qty: {item.qty}</p>
                      <p className="font-bold text-red-600">{formatMoney(item.price * item.qty)}</p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 flex justify-between text-lg font-black">
                  <span>Total</span>
                  <span>{formatMoney(cartTotal)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
