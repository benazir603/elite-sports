import Header from '../components/Header'

export const metadata = {
  title: 'Privacy Policy - Elite Sports',
  description: 'Privacy policy for Elite Sports.',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-6">Privacy Policy</h1>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              Elite Sports respects your privacy. This policy explains how we collect, use and protect your personal information.
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Information We Collect</h2>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Name, email and phone number when you create an account or place an order.</li>
              <li>Shipping and billing addresses.</li>
              <li>Payment details, which are processed securely by our payment partners.</li>
              <li>Browsing behavior and cookies to improve your experience.</li>
            </ul>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">How We Use Your Information</h2>
            <p className="mb-4">
              We use your information to process orders, communicate with you, improve our website and prevent fraud. We do not sell your personal data to third parties.
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Security</h2>
            <p className="mb-4">
              We use industry-standard security measures to protect your data. However, no online transmission is 100% secure.
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Changes</h2>
            <p className="mb-4">
              We may update this policy from time to time. Please review it periodically. If you have questions, contact us through the <a href="/support" className="text-red-600 font-semibold hover:underline">Support</a> page.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
