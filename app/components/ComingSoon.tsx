import Link from 'next/link'
import Header from './Header'

interface ComingSoonProps {
  title: string
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-10 text-center">
          <span className="inline-block bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Coming Soon
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-3">
            {title}
          </h1>
          <p className="text-gray-600 mb-2">
            We&apos;re stocking this category right now. Products will be available here shortly.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Need something urgently? Message us on WhatsApp — we may have it in store.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/badminton"
              className="flex items-center justify-center bg-black hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition"
            >
              Shop Badminton
            </Link>
            <a
              href={`https://wa.me/919500030150?text=${encodeURIComponent(`Hi, I'm looking for ${title} products`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition"
            >
              Ask on WhatsApp
            </a>
            <Link
              href="/"
              className="flex items-center justify-center border border-gray-300 hover:border-red-600 text-gray-700 font-bold py-3 px-6 rounded-full transition"
            >
              Home
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
