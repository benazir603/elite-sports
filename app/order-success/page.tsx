'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/Header'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black mb-2">Payment Successful</h1>
          <p className="text-gray-600 mb-6">Thank you for your order.</p>

          {orderId && (
            <p className="text-sm text-gray-500 mb-6">
              Order ID: <span className="font-bold text-gray-900">#{orderId}</span>
            </p>
          )}

          <div className="space-y-3">
            <Link
              href="/track-order"
              className="block w-full bg-black hover:bg-red-600 text-white font-bold py-3 rounded-full transition"
            >
              Track Order
            </Link>
            <Link
              href="/"
              className="block w-full border border-gray-300 hover:border-red-600 text-gray-700 font-bold py-3 rounded-full transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <p className="text-gray-500">Loading...</p>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
