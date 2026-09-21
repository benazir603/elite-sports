'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/Header'

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not reset password')
      setSuccess(data.success || 'Password updated successfully')
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-black text-center mb-2">Reset password</h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          {email ? `Create a new password for ${email}` : 'Create a new password'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
              placeholder="At least 8 characters"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
              placeholder="Re-enter new password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {success && (
            <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center font-semibold">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-black hover:bg-red-600 text-white font-bold py-3 rounded-full transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/account" className="text-sm text-red-600 font-semibold hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <p className="text-gray-500">Loading...</p>
          </main>
        }
      >
        <ResetForm />
      </Suspense>
    </>
  )
}
