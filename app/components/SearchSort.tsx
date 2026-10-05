'use client'

import { useRouter } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
]

export default function SearchSort({ query, sort }: { query: string; sort: string }) {
  const router = useRouter()

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams({ q: query })
    if (event.target.value !== 'relevance') params.set('sort', event.target.value)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <select
      value={sort}
      onChange={onChange}
      aria-label="Sort search results"
      className="px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-red-600"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
