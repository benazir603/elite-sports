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
            <div className="bg-gray-50 rounded-xl p-5">
              <h2 className="font-bold text-gray-900 mb-2">Email</h2>
              <p className="text-gray-600">elitesportselaiyur@gmail.com</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5">
              <h2 className="font-bold text-gray-900 mb-2">Phone</h2>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 sm:col-span-2">
              <h2 className="font-bold text-gray-900 mb-2">Address</h2>
              <p className="text-gray-600">123 Athlete Ave, New York, NY</p>
            </div>
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
