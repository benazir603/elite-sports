'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ProductInfoSectionsProps {
  description: string
  bullets: string[]
}

const PHONE_DISPLAY = '+91 95000 30150'
const PHONE_LINK = '+919500030150'

export default function ProductInfoSections({ description, bullets }: ProductInfoSectionsProps) {
  const [openSection, setOpenSection] = useState<string>('details')

  function sectionButton(id: string, label: string) {
    const isOpen = openSection === id
    return (
      <button
        type="button"
        onClick={() => setOpenSection(isOpen ? '' : id)}
        className="flex min-h-12 w-full items-center justify-between gap-4 py-4 text-left font-bold text-gray-900"
        aria-expanded={isOpen}
        aria-controls={`product-${id}`}
      >
        <span>{label}</span>
        <svg
          className={`h-5 w-5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    )
  }

  return (
    <div className="mb-8 rounded-lg border border-gray-200 px-5">
      <section className="border-b border-gray-200">
        {sectionButton('details', 'Details')}
        {openSection === 'details' && (
          <div id="product-details" className="pb-5 text-sm leading-relaxed text-gray-700">
            {bullets.length > 0 && (
              <ul className="mb-4 list-disc space-y-1.5 pl-5">
                {bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}
              </ul>
            )}
            {description ? (
              <div className="space-y-3 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: description }} />
            ) : (
              <p>Product specifications and options are shown above. Contact us if you need help choosing the right product.</p>
            )}
          </div>
        )}
      </section>

      <section className="border-b border-gray-200">
        {sectionButton('shipping', 'Shipping & Returns')}
        {openSection === 'shipping' && (
          <div id="product-shipping" className="pb-5 text-sm leading-relaxed text-gray-700">
            <p>Delivery availability, charges and estimated time depend on your PIN code, product availability and courier serviceability.</p>
            <p className="mt-2">Return and exchange eligibility depends on the product condition and the current store policy.</p>
            <div className="mt-4 flex flex-wrap gap-4 font-semibold">
              <Link href="/shipping" className="text-red-600 hover:underline">View shipping information</Link>
              <Link href="/returns" className="text-red-600 hover:underline">View returns policy</Link>
            </div>
          </div>
        )}
      </section>

      <section>
        {sectionButton('questions', 'Stuck on a question?')}
        {openSection === 'questions' && (
          <div id="product-questions" className="pb-5 text-sm leading-relaxed text-gray-700">
            <p className="font-semibold text-gray-900">Speak with an Elite Sports product expert</p>
            <p className="mt-1">Get help choosing the right size, equipment, specification, grip, string, or other product option.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`tel:${PHONE_LINK}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-gray-300 px-5 font-bold text-gray-900 transition hover:border-red-600 hover:text-red-600"
              >
                Call {PHONE_DISPLAY}
              </a>
              <a
                href="https://wa.me/919500030150"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#25D366] px-5 font-bold text-white transition hover:bg-[#1fb85a]"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
