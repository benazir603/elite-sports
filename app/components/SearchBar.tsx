'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'

interface Suggestion {
  id: number
  name: string
  price: number
  regularPrice: number
  image: string
  url: string
}

function formatMoney(amount: number) {
  return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default function SearchBar({ onSubmitted }: { onSubmitted?: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const value = query.trim()
    if (value.length < 2) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(value)}`)
        const data = await res.json()
        setSuggestions(data.suggestions || [])
        setOpen(true)
      } catch {
        setSuggestions([])
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocumentClick)
    return () => document.removeEventListener('mousedown', onDocumentClick)
  }, [])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const value = query.trim()
    if (!value) return
    setOpen(false)
    trackEvent('search', { search_term: value })
    onSubmitted?.()
    router.push(`/search?q=${encodeURIComponent(value)}`)
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit} className="relative w-full" role="search">
        <input
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search for products"
          aria-label="Search products"
          autoComplete="off"
          className="w-full pl-5 pr-12 py-2.5 text-sm border-2 border-gray-200 rounded-full focus:outline-none focus:border-red-600 transition"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
          <ul>
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <Link
                  href={suggestion.url}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition"
                >
                  {suggestion.image ? (
                    <img src={suggestion.image} alt="" className="w-10 h-10 object-contain rounded bg-gray-50 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0" />
                  )}
                  <span className="flex-1 text-sm text-gray-900 line-clamp-1">{suggestion.name}</span>
                  <span className="text-sm font-bold text-red-600 flex-shrink-0">{formatMoney(suggestion.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={submit}
            className="w-full px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-gray-600 hover:bg-gray-50 border-t border-gray-100 transition"
          >
            View all results for &quot;{query.trim()}&quot;
          </button>
        </div>
      )}
    </div>
  )
}
