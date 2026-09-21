import Header from '../components/Header'

export const metadata = {
  title: 'Returns & Exchanges - Elite Sports',
  description: 'Returns, exchanges and refund policy for Elite Sports.',
}

export default function ReturnsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-6">Returns & Exchanges</h1>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              We want you to be happy with every purchase. If you are not satisfied, you can return or exchange most items within 30 days of delivery.
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Return Conditions</h2>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Items must be unused, unwashed, and in original packaging.</li>
              <li>Tags and labels must be intact.</li>
              <li>Proof of purchase is required.</li>
            </ul>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">How to Return</h2>
            <p className="mb-4">
              Contact our support team through the <a href="/support" className="text-red-600 font-semibold hover:underline">Support</a> page with your order number. We will arrange a pickup and process your refund within 7-10 business days after receiving the item.
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Exchanges</h2>
            <p className="mb-4">
              Exchanges are subject to stock availability. If the requested size or color is unavailable, a refund will be issued.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
