import Header from '../components/Header'

export const metadata = {
  title: 'Shipping Info - Elite Sports',
  description: 'Shipping and delivery information for Elite Sports orders.',
}

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-6">Shipping Info</h1>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              We ship across India. Orders are processed within 1-2 business days and delivered within 3-7 business days depending on your location.
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Free Shipping</h2>
            <p className="mb-4">
              Free standard shipping is available on all orders over ₹8,300. Orders below this amount are charged a flat shipping fee at checkout.
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Order Tracking</h2>
            <p className="mb-4">
              Once your order is shipped, you will receive an email with tracking details. You can also use the <a href="/track-order" className="text-red-600 font-semibold hover:underline">Track Order</a> page.
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Delivery Partners</h2>
            <p className="mb-4">
              We partner with trusted courier services to ensure safe and timely delivery of your sports gear.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
