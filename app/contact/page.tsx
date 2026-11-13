import Header from '../components/Header'

export const metadata = {
  title: 'Contact Us - Elite Sports',
  description: 'Contact Elite Sports for support, orders and inquiries.',
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-4">Contact Us</h1>
          <p className="text-gray-600 mb-8">
            Have a question about an order, product or partnership? Reach out to us and we will get back to you as soon as possible.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-5 sm:col-span-2">
              <h2 className="font-bold text-gray-900 mb-2">Address</h2>
              <p className="text-gray-600">No 6, Mohan Complex, Tambaram Eastern Bypass Rd, Tiruvanchery, Selaiyur, Chennai, Puthur, Tamil Nadu 600126</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5">
              <h2 className="font-bold text-gray-900 mb-2">Phone</h2>
              <p className="text-gray-600">+91 95000 30150</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5">
              <h2 className="font-bold text-gray-900 mb-2">Email</h2>
              <p className="text-gray-600">elitesportselaiyur@gmail.com</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-bold text-gray-900 mb-3">Find Us on the Map</h2>
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <iframe
                src="https://maps.google.com/maps?cid=10733533905815597229&output=embed"
                width="100%"
                height="360"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="Elite Sports store location on Google Maps"
              />
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('V4QR+V39 Tiruvanchery, Selaiyur, Puthur, Tamil Nadu 600126')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-full transition text-sm"
            >
              Get Directions
            </a>
          </div>

          <a
            href="/support"
            className="inline-block bg-black hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full transition"
          >
            Send a Message
          </a>
        </div>
      </main>
    </>
  )
}
