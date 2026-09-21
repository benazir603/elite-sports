'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Header from '../components/Header'

export default function AccountPage() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    if (session?.user) {
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders)
        })
        .catch(() => {})
        .finally(() => setOrdersLoading(false))
    }
  }, [session])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    alert(`Login attempted for ${email}`)
  }

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMessage('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage('Please fill in all fields to verify.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('New password and verify password do not match.')
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage('New password must be at least 8 characters.')
      return
    }

    setPasswordMessage('Password verified and updated successfully (demo).')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  if (session?.user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-black mb-4">Order History</h2>
              {ordersLoading ? (
                <p className="text-gray-500">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-gray-500">No orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">{new Date(order.date_created).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600 capitalize">{order.status}</p>
                      </div>
                      <p className="font-black text-red-600">₹{Number(order.total).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
              <h2 className="text-xl font-black mb-4">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Current Password (Verify)</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    placeholder="Enter current password to verify"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    placeholder="At least 8 characters"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Verify New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
                {passwordMessage && (
                  <p className="text-sm text-center text-red-600">{passwordMessage}</p>
                )}
                <button
                  type="submit"
                  className="w-full bg-black hover:bg-red-600 text-white font-bold py-3 rounded-full transition"
                >
                  Update Password
                </button>
              </form>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black hover:bg-red-600 text-white font-bold py-3 rounded-full transition"
            >
              Log in
            </button>
          </form>

          <div className="text-center mt-4">
            <a href="/forgot-password" className="text-sm text-blue-600 hover:underline hover:text-red-600">
              Forgot your password?
            </a>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/account' })}
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
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <a href="/" className="text-red-600 font-semibold hover:underline">
              Continue shopping
            </a>
          </p>
        </div>
      </main>
    </>
  )
}
