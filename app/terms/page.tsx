import Header from '../components/Header'

export const metadata = {
  title: 'Terms of Service - Elite Sports',
  description: 'Terms of service for Elite Sports.',
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-6">Terms of Service</h1>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              By using the Elite Sports website, you agree to the following terms and conditions. Please read them carefully.
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Orders & Payments</h2>
            <p className="mb-4">
              All orders are subject to product availability and confirmation of the order price. Payment must be completed before an order is processed.
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Pricing</h2>
            <p className="mb-4">
              Prices are listed in Indian Rupees (₹) and are subject to change without notice. The price charged will be the price displayed at checkout.
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Shipping & Delivery</h2>
            <p className="mb-4">
              Delivery times are estimates and may vary based on location and courier availability. Elite Sports is not responsible for delays caused by third-party couriers.
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Returns</h2>
            <p className="mb-4">
              Returns and exchanges are handled according to our <a href="/returns" className="text-red-600 font-semibold hover:underline">Returns & Exchanges</a> policy.
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Governing Law</h2>
            <p className="mb-4">
              These terms are governed by the laws of India. Any disputes will be resolved in the courts of India.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
