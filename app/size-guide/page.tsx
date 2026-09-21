import Header from '../components/Header'

export const metadata = {
  title: 'Size Guide - Elite Sports',
  description: 'Size guide for shoes, apparel and sports equipment at Elite Sports.',
}

export default function SizeGuidePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-6">Size Guide</h1>
          <p className="text-gray-600 mb-6">
            Use the charts below to find your perfect fit. If you are between sizes, we recommend sizing up for a more comfortable fit.
          </p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">Footwear - Men's</h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm text-left text-gray-600 border border-gray-200">
              <thead className="bg-gray-100 text-gray-900 font-bold">
                <tr>
                  <th className="px-4 py-2">US</th>
                  <th className="px-4 py-2">UK</th>
                  <th className="px-4 py-2">EU</th>
                  <th className="px-4 py-2">Foot length (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t"><td className="px-4 py-2">7</td><td className="px-4 py-2">6</td><td className="px-4 py-2">40</td><td className="px-4 py-2">25</td></tr>
                <tr className="border-t"><td className="px-4 py-2">8</td><td className="px-4 py-2">7</td><td className="px-4 py-2">41</td><td className="px-4 py-2">26</td></tr>
                <tr className="border-t"><td className="px-4 py-2">9</td><td className="px-4 py-2">8</td><td className="px-4 py-2">42</td><td className="px-4 py-2">27</td></tr>
                <tr className="border-t"><td className="px-4 py-2">10</td><td className="px-4 py-2">9</td><td className="px-4 py-2">43</td><td className="px-4 py-2">28</td></tr>
                <tr className="border-t"><td className="px-4 py-2">11</td><td className="px-4 py-2">10</td><td className="px-4 py-2">44</td><td className="px-4 py-2">29</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">Apparel</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600 border border-gray-200">
              <thead className="bg-gray-100 text-gray-900 font-bold">
                <tr>
                  <th className="px-4 py-2">Size</th>
                  <th className="px-4 py-2">Chest (in)</th>
                  <th className="px-4 py-2">Waist (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t"><td className="px-4 py-2">S</td><td className="px-4 py-2">36-38</td><td className="px-4 py-2">30-32</td></tr>
                <tr className="border-t"><td className="px-4 py-2">M</td><td className="px-4 py-2">38-40</td><td className="px-4 py-2">32-34</td></tr>
                <tr className="border-t"><td className="px-4 py-2">L</td><td className="px-4 py-2">40-42</td><td className="px-4 py-2">34-36</td></tr>
                <tr className="border-t"><td className="px-4 py-2">XL</td><td className="px-4 py-2">42-44</td><td className="px-4 py-2">36-38</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
