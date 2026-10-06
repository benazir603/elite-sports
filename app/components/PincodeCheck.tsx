'use client'

import { useState } from 'react'

interface CheckResult {
  serviceable: boolean
  eta?: string
  courier?: string
  message?: string
}

export default function PincodeCheck({ weight }: { weight: number }) {
  const [pincode, setPincode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)

  async function check() {
    const value = pincode.trim()
    if (!/^\d{6}$/.test(value)) {
      setResult({ serviceable: false, message: 'Please enter a valid 6-digit pincode' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const params = new URLSearchParams({ pincode: value, weight: String(weight) })
      const res = await fetch(`/api/pincode-check?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      setResult({
        serviceable: res.ok && data.serviceable === true,
        eta: data.eta,
        courier: data.courier,
        message: data.message,
      })
    } catch {
      setResult({ serviceable: false, message: 'Could not check delivery right now. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (!Number.isFinite(weight) || weight <= 0) {
    return (
      <p className="mt-3 text-sm font-semibold text-amber-700">
        Online delivery check is unavailable for this product. Please contact support for delivery assistance.
      </p>
    )
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(event) => setPincode(event.target.value.replace(/\D/g, ''))}
          onKeyDown={(event) => event.key === 'Enter' && check()}
          placeholder="Enter PIN code"
          aria-label="Enter delivery PIN code"
          className="w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
        />
        <button
          type="button"
          onClick={check}
          disabled={loading || pincode.trim().length !== 6}
          className="px-4 py-2 text-sm font-bold text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </div>
      {result && (
        <p className={`mt-2 text-sm font-semibold ${result.serviceable ? 'text-green-700' : 'text-red-600'}`}>
          {result.serviceable
            ? `Delivery available${result.eta ? ` — estimated ${result.eta}` : ''}${result.courier ? ` via ${result.courier}` : ''}`
            : result.message || 'Delivery is not available to this pincode'}
        </p>
      )}
    </div>
  )
}
