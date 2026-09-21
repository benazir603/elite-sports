'use client'

import { useState } from 'react'
import Header from '../components/Header'

interface ShippingAddress {
  first_name?: string
  last_name?: string
  address_1?: string
  address_2?: string
  city?: string
  state?: string
  postcode?: string
  country?: string
}

interface LineItem {
  name: string
  quantity: number
  total: string
}

interface OrderResult {
  id: number
  status: string
  total: string
  date_created: string
  line_items: LineItem[]
  tracking_number: string
  courier: string
  delivery_status: string
  shipping?: ShippingAddress
}

const steps = ['Order Placed', 'Shipped', 'Out for Delivery', 'Delivered']

function formatMoney(amount: string) {
  return '₹' + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function getTrackingUrl(courier: string, trackingNumber: string) {
  const c = courier.toLowerCase()
  if (c.includes('delhivery')) return `https://www.delhivery.com/track/?waybill=${encodeURIComponent(trackingNumber)}`
  if (c.includes('blue dart')) return `https://www.bluedart.com/tracking/?track=${encodeURIComponent(trackingNumber)}`
  if (c.includes('dtdc')) return `https://tracking.dtdc.com/?ref=${encodeURIComponent(trackingNumber)}`
  if (c.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`
  if (c.includes('dhl')) return `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(trackingNumber)}`
  if (c.includes('india post') || c.includes('speed post')) return 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx'
  return '#'
}

function getActiveStep(order: OrderResult) {
  const status = order.status
  const delivery = order.delivery_status.toLowerCase()

  if (status === 'completed' || delivery === 'delivered') return { active: 3, completed: [0, 1, 2, 3] }
  if (delivery === 'out_for_delivery') return { active: 2, completed: [0, 1] }
  if (status === 'processing' || delivery === 'shipped') return { active: 1, completed: [0] }
  return { active: 0, completed: [] }
}

function formatAddress(shipping?: ShippingAddress) {
  if (!shipping) return ''
  const parts = [
    [shipping.first_name, shipping.last_name].filter(Boolean).join(' '),
    shipping.address_1,
    shipping.address_2,
    [shipping.city, shipping.state, shipping.postcode].filter(Boolean).join(', '),
    shipping.country,
  ]
  return parts.filter(Boolean).join(', ')
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<OrderResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orderId.trim() || !email.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const res = await fetch(`/api/track-order?id=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Order not found')
      setOrder(data)
    } catch (err: any) {
      setError(err.message || 'Could not find order')
    } finally {
      setLoading(false)
    }
  }

  const timeline = order ? getActiveStep(order) : null

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-black text-center mb-2">Track Order</h1>
          <p className="text-gray-500 text-center text-sm mb-6">Enter your order number and email.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">#</span>
              <input
                type="text"
                inputMode="numeric"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                placeholder="12345"
                required
              />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
              placeholder="you@example.com"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-red-600 text-white font-bold py-3 rounded-full transition disabled:opacity-50"
            >
              {loading ? 'Tracking...' : 'Track'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {order && timeline && (
            <div className="mt-8 space-y-6">
              {/* Order summary */}
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">Order #{order.id}</span>
                  <span className="text-sm font-semibold capitalize px-2 py-1 bg-gray-100 rounded-full">
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{new Date(order.date_created).toLocaleDateString()}</p>
                <p className="font-black text-red-600 mt-2">{formatMoney(order.total)}</p>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h2 className="font-bold text-sm uppercase tracking-wide text-gray-700 mb-6">Order Status</h2>
                <div className="relative flex items-start justify-between">
                  {steps.map((step, index) => {
                    const isCompleted = timeline.completed.includes(index)
                    const isActive = timeline.active === index
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center relative z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 mb-2 ${
                            isCompleted
                              ? 'bg-red-600 border-red-600 text-white'
                              : isActive
                              ? 'bg-white border-red-600 text-red-600'
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold text-center ${
                            isCompleted || isActive ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {step}
                        </span>
                        {isActive && <span className="w-2 h-2 bg-red-600 rounded-full mt-1 animate-pulse" />}
                        {index < steps.length - 1 && (
                          <div
                            className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${
                              isCompleted ? 'bg-red-600' : 'bg-gray-300'
                            }`}
                            style={{ transform: 'translateX(50%)' }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Tracking details */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h2 className="font-bold text-sm uppercase tracking-wide text-gray-700 mb-3">Shipment Details</h2>
                {order.tracking_number || order.courier ? (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                      {order.courier && (
                        <div>
                          <span className="text-gray-500">Courier</span>
                          <p className="font-semibold text-gray-900">{order.courier}</p>
                        </div>
                      )}
                      {order.tracking_number && (
                        <div>
                          <span className="text-gray-500">Tracking Number</span>
                          <p className="font-semibold text-gray-900">{order.tracking_number}</p>
                        </div>
                      )}
                    </div>
                    {order.tracking_number && (
                      <a
                        href={getTrackingUrl(order.courier, order.tracking_number)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-black hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full text-sm transition"
                      >
                        Track Shipment
                      </a>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">
                      Tracking details will be added once your order is shipped.
                    </p>
                    <p>
                      For reference, your temporary order ID is: <span className="font-bold text-gray-900">#{order.id}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Shipping address */}
              {order.shipping && formatAddress(order.shipping) && (
                <div className="border border-gray-200 rounded-xl p-4">
                  <h2 className="font-bold text-sm uppercase tracking-wide text-gray-700 mb-2">Delivery Address</h2>
                  <p className="text-sm text-gray-600">{formatAddress(order.shipping)}</p>
                </div>
              )}

              {/* Items */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h2 className="font-bold text-sm uppercase tracking-wide text-gray-700 mb-3">Items Ordered</h2>
                <ul className="space-y-2">
                  {order.line_items.map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 flex justify-between">
                      <span>{item.name} x {item.quantity}</span>
                      <span className="font-medium">{formatMoney(item.total)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
