'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Header from '../components/Header'

function AccountPageContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/account'
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [customer, setCustomer] = useState<any>(null)
  const [accountTab, setAccountTab] = useState<'orders' | 'addresses' | 'track'>('orders')
  const [addressForm, setAddressForm] = useState({
    first_name: '', last_name: '', phone: '',
    address_1: '', address_2: '', city: '', state: '', postcode: '',
  })
  const [editingAddress, setEditingAddress] = useState(false)
  const [addressLoading, setAddressLoading] = useState(false)
  const [addressMessage, setAddressMessage] = useState('')

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const [registerFirstName, setRegisterFirstName] = useState('')
  const [registerLastName, setRegisterLastName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerSuccess, setRegisterSuccess] = useState('')

  useEffect(() => {
    if (session?.user) {
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders)
        })
        .catch(() => {})
        .finally(() => setOrdersLoading(false))

      fetch('/api/account')
        .then((res) => res.json())
        .then((data) => {
          if (data.customer) setCustomer(data.customer)
        })
        .catch(() => {})
    }
  }, [session])

  function addressLines(addr: any) {
    if (!addr) return []
    return [
      [addr.first_name, addr.last_name].filter(Boolean).join(' '),
      addr.address_1,
      addr.address_2,
      [addr.city, addr.state, addr.postcode].filter(Boolean).join(', '),
      addr.country,
      addr.phone ? `Phone: ${addr.phone}` : '',
    ].filter(Boolean)
  }

  function startEditAddress() {
    const s = customer?.shipping || {}
    setAddressForm({
      first_name: s.first_name || '',
      last_name: s.last_name || '',
      phone: s.phone || '',
      address_1: s.address_1 || '',
      address_2: s.address_2 || '',
      city: s.city || '',
      state: s.state || '',
      postcode: s.postcode || '',
    })
    setAddressMessage('')
    setEditingAddress(true)
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault()
    setAddressLoading(true)
    setAddressMessage('')
    try {
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setAddressMessage('Address saved.')
      setEditingAddress(false)
      const refreshed = await fetch('/api/account')
      const refreshedData = await refreshed.json()
      if (refreshedData.customer) setCustomer(refreshedData.customer)
    } catch (err: any) {
      setAddressMessage(err.message || 'Failed to save address')
    } finally {
      setAddressLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    const result = await signIn('credentials', {
      email: loginEmail,
      password: loginPassword,
      callbackUrl: '/account',
      redirect: false,
    })

    setLoginLoading(false)
    if (result?.error) {
      if (result.code === 'email_not_verified') {
        setLoginError('Please verify your email before logging in.')
        setUnverifiedEmail(loginEmail)
        setResendMessage('')
      } else {
        setLoginError('Invalid email or password.')
      }
    } else if (result?.ok) {
      window.location.href = redirectTo
    }
  }

  async function handleResendVerification() {
    setResendLoading(true)
    setResendMessage('')
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail }),
      })
      const data = await res.json()
      setResendMessage(data.message || 'Verification email sent.')
    } catch {
      setResendMessage('Failed to send. Try again later.')
    } finally {
      setResendLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegisterError('')
    setRegisterSuccess('')
    setRegisterLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: registerFirstName,
        lastName: registerLastName,
        email: registerEmail,
        password: registerPassword,
      }),
    })

    const data = await res.json()
    setRegisterLoading(false)

    if (!res.ok) {
      setRegisterError(data.error || 'Registration failed')
      return
    }

    setRegisterSuccess(
      'Account created! We sent a verification link to your email. Please verify before logging in.'
    )
    setActiveTab('login')
    setLoginEmail(registerEmail)
  }

  if (status === 'loading') {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </>
    )
  }

  const userEmail = session?.user?.email || ''
  const userName = session?.user?.name || userEmail

  if (session?.user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-black mb-1">My Account</h2>
              <p className="text-gray-600 mb-6">{userName}</p>

              <div className="flex rounded-full bg-gray-100 p-1 mb-8">
                {(['orders', 'addresses', 'track'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setAccountTab(tab)}
                    className={`flex-1 py-2 text-sm font-bold rounded-full transition capitalize ${
                      accountTab === tab ? 'bg-black text-white' : 'text-gray-600'
                    }`}
                  >
                    {tab === 'orders' ? 'Orders' : tab === 'addresses' ? 'Addresses' : 'Track Order'}
                  </button>
                ))}
              </div>

              {accountTab === 'orders' && (
                <>
                  <h3 className="text-lg font-bold mb-4">Order History</h3>
                  {ordersLoading ? (
                    <p className="text-gray-500">Loading orders...</p>
                  ) : orders.length === 0 ? (
                    <p className="text-gray-500">No orders yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <p className="font-bold">Order #{order.id}</p>
                              <p className="text-sm text-gray-500">{new Date(order.date_created).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">{order.status}</span>
                              <p className="font-black text-red-600">₹{Number(order.total).toFixed(2)}</p>
                            </div>
                          </div>
                          {order.line_items?.length > 0 && (
                            <ul className="mt-3 text-sm text-gray-600 space-y-1 border-t border-gray-100 pt-3">
                              {order.line_items.map((item: any, i: number) => (
                                <li key={i}>{item.name} × {item.quantity}</li>
                              ))}
                            </ul>
                          )}
                          <a
                            href={`/track-order?id=${order.id}&email=${encodeURIComponent(userEmail)}`}
                            className="inline-block mt-3 text-sm font-semibold text-red-600 hover:underline"
                          >
                            Track this order →
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {accountTab === 'addresses' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Delivery Address</h3>
                    {!editingAddress && (
                      <button
                        type="button"
                        onClick={startEditAddress}
                        className="text-sm font-semibold text-red-600 hover:underline"
                      >
                        {addressLines(customer?.shipping).length === 0 ? '+ Add Address' : 'Edit'}
                      </button>
                    )}
                  </div>

                  {editingAddress ? (
                    <form onSubmit={handleSaveAddress} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={addressForm.first_name}
                          onChange={(e) => setAddressForm({ ...addressForm, first_name: e.target.value })}
                          placeholder="First name"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                        />
                        <input
                          type="text"
                          value={addressForm.last_name}
                          onChange={(e) => setAddressForm({ ...addressForm, last_name: e.target.value })}
                          placeholder="Last name"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="Phone number"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                      />
                      <input
                        type="text"
                        value={addressForm.address_1}
                        onChange={(e) => setAddressForm({ ...addressForm, address_1: e.target.value })}
                        placeholder="Address line 1 (house no, street)"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                      />
                      <input
                        type="text"
                        value={addressForm.address_2}
                        onChange={(e) => setAddressForm({ ...addressForm, address_2: e.target.value })}
                        placeholder="Address line 2 (optional)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          placeholder="City"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                        />
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          placeholder="State"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <input
                        type="text"
                        value={addressForm.postcode}
                        onChange={(e) => setAddressForm({ ...addressForm, postcode: e.target.value })}
                        placeholder="Pincode"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                      />
                      {addressMessage && <p className={`text-sm text-center ${addressMessage === 'Address saved.' ? 'text-green-600' : 'text-red-600'}`}>{addressMessage}</p>}
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={addressLoading}
                          className="flex-1 bg-black hover:bg-red-600 text-white font-bold py-3 rounded-full transition disabled:opacity-50"
                        >
                          {addressLoading ? 'Saving...' : 'Save Address'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAddress(false)}
                          className="px-6 py-3 border border-gray-300 rounded-full font-bold hover:border-black transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {addressMessage === 'Address saved.' && (
                        <p className="text-sm text-green-600 mb-3">{addressMessage}</p>
                      )}
                      {!customer || addressLines(customer.shipping).length === 0 ? (
                        <p className="text-gray-500">No delivery address saved yet.</p>
                      ) : (
                        <div className="border border-gray-200 rounded-xl p-4">
                          {addressLines(customer.shipping).map((line: string, i: number) => (
                            <p key={i} className="text-sm text-gray-700">{line}</p>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {accountTab === 'track' && (
                <>
                  <h3 className="text-lg font-bold mb-4">Track Order</h3>
                  {orders.length === 0 ? (
                    <p className="text-gray-500">No orders to track yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <a
                          key={order.id}
                          href={`/track-order?id=${order.id}&email=${encodeURIComponent(userEmail)}`}
                          className="flex items-center justify-between border border-gray-200 rounded-xl p-4 hover:border-red-500 transition"
                        >
                          <div>
                            <p className="font-bold">Order #{order.id}</p>
                            <p className="text-sm text-gray-500 capitalize">{order.status} · {new Date(order.date_created).toLocaleDateString()}</p>
                          </div>
                          <span className="text-red-600 font-semibold text-sm">Track →</span>
                        </a>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-black text-center mb-6">My Account</h1>

          <div className="flex rounded-full bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-sm font-bold rounded-full transition ${
                activeTab === 'login' ? 'bg-black text-white' : 'text-gray-600'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-sm font-bold rounded-full transition ${
                activeTab === 'register' ? 'bg-black text-white' : 'text-gray-600'
              }`}
            >
              Register
            </button>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 focus:outline-none"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {loginError && <p className="text-sm text-red-600 text-center">{loginError}</p>}
              {unverifiedEmail && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="text-sm font-semibold text-blue-600 hover:text-red-600 hover:underline disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend verification email'}
                  </button>
                  {resendMessage && <p className="text-sm text-green-600 mt-1">{resendMessage}</p>}
                </div>
              )}
              <div className="text-right">
                <a href="/forgot-password" className="text-sm text-blue-600 hover:text-red-600 hover:underline">
                  Forgot your password?
                </a>
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-black hover:bg-red-600 text-white font-bold py-3 rounded-full transition disabled:opacity-50"
              >
                {loginLoading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">First Name</label>
                  <input
                    type="text"
                    value={registerFirstName}
                    onChange={(e) => setRegisterFirstName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    value={registerLastName}
                    onChange={(e) => setRegisterLastName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 pr-12"
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 focus:outline-none"
                    aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegisterPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {registerError && <p className="text-sm text-red-600 text-center">{registerError}</p>}
              {registerSuccess && <p className="text-sm text-green-600 text-center">{registerSuccess}</p>}
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full bg-black hover:bg-red-600 text-white font-bold py-3 rounded-full transition disabled:opacity-50"
              >
                {registerLoading ? 'Creating account...' : 'Register'}
              </button>
            </form>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: redirectTo })}
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

          <p className="text-center text-sm text-gray-500 mt-6">
            Need help?{' '}
            <a href="/contact" className="text-red-600 font-semibold hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </main>
    </>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<><Header /><main className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></main></>}>
      <AccountPageContent />
    </Suspense>
  )
}
