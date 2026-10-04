'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/Header'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setError('Missing verification link.')
      return
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Verification failed')
        setStatus('success')
      })
      .catch((err) => {
        setStatus('error')
        setError(err.message || 'Verification failed')
      })
  }, [searchParams])

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
      {status === 'loading' && (
        <>
          <h1 className="text-2xl font-black mb-2">Verifying...</h1>
          <p className="text-gray-500">Please wait while we verify your email.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black mb-2">Email Verified</h1>
          <p className="text-gray-500 mb-6">Your account is now active. You can log in.</p>
          <Link
            href="/account"
            className="inline-block bg-black hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full transition"
          >
            Go to Login
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-black mb-2">Verification Failed</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/account"
            className="inline-block bg-black hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full transition"
          >
            Back to Login
          </Link>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Suspense fallback={<p className="text-gray-500">Loading...</p>}>
          <VerifyEmailContent />
        </Suspense>
      </main>
    </>
  )
}
