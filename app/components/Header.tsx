'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from './CartProvider'

interface HeaderProps {
  cartCount?: number
}

interface CategoryItem {
  label: string
  children?: string[]
}

interface Category {
  name: string
  items: CategoryItem[]
}

const categories: Category[] = [
  {
    name: 'CRICKET',
    items: [
      { label: 'Bats / Balls' },
      { label: 'Batting gloves' },
      { label: 'Pads' },
      { label: 'Helmet' },
      { label: 'Guards' },
      { label: 'Cricket accessories' },
    ],
  },
  {
    name: 'FOOTBALL',
    items: [
      { label: 'Footballs' },
      { label: 'Studs' },
      { label: 'Shin Guards' },
      { label: 'Goalkeeper Gloves' },
      { label: 'Accessories' },
    ],
  },
  {
    name: 'BASKETBALL',
    items: [
      { label: 'Balls' },
      { label: 'Accessories' },
    ],
  },
  {
    name: 'CARROM & CHESS',
    items: [
      { label: 'Carrom Boards' },
      { label: 'Coins & Strikers' },
      { label: 'Chess Boards' },
    ],
  },
  {
    name: 'TABLE TENNIS',
    items: [
      { label: 'Bats' },
      { label: 'Balls' },
      { label: 'Rubbers' },
      { label: 'Accessories' },
    ],
  },
  {
    name: 'FITNESS',
    items: [
      { label: 'Dumbbells' },
      { label: 'Kettlebells' },
      { label: 'Resistance Bands' },
      { label: 'Yoga Mats' },
      { label: 'Skipping Ropes' },
      { label: 'Fitness Accessories' },
    ],
  },
  {
    name: 'VOLLEYBALL',
    items: [
      { label: 'Balls' },
      { label: 'Nets' },
      { label: 'Accessories' },
    ],
  },
  {
    name: 'SPORTS FOOTWEAR & APPAREL',
    items: [
      { label: 'Non-Marking Shoes' },
      { label: 'Running Shoes' },
      { label: 'Sportswear' },
      { label: 'Gym Wear' },
    ],
  },
  {
    name: 'SWIMMING',
    items: [
      { label: 'Costumes' },
      { label: 'Caps' },
      { label: 'Goggles' },
      { label: 'Accessories' },
    ],
  },
  {
    name: 'OTHER ITEMS',
    items: [
      { label: 'Sports Trophies & Medals' },
      { label: 'School Sports Equipment' },
      { label: 'Sports Accessories' },
    ],
  },
  {
    name: 'BADMINTON',
    items: [
      { label: 'Rackets' },
      { label: 'Shuttlecocks' },
      { label: 'Strings & Gutting' },
      { label: 'Grip' },
      { label: 'Shoes' },
      { label: 'Accessories' },
    ],
  },
]

export default function Header({ cartCount: _cartCount }: HeaderProps) {
  const { cartCount, openCartDrawer } = useCart()
  const { data: session } = useSession()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileActive, setMobileActive] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  function handleSearch() {
    const q = searchQuery.trim()
    if (q) {
      window.location.href = `/search?q=${encodeURIComponent(q)}`
    }
  }

  const activeCatData = categories.find((c) => c.name === activeCategory)

  return (
    <header className="sticky top-0 z-50">
      {/* Top strip */}
      <div className="bg-black text-white text-[11px] tracking-wide">
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between">
          <span className="uppercase font-semibold">Free shipping on orders over ₹8,300</span>
          <div className="hidden md:flex items-center gap-6 font-semibold uppercase">
            <Link href="/support" className="hover:text-red-500 transition">Support</Link>
            <Link href="/track-order" className="hover:text-red-500 transition">Track Order</Link>
            {session?.user ? (
              <div className="flex items-center gap-3">
                <span className="normal-case">Hi, {session.user.name || session.user.email}</span>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="hover:text-red-500 transition">Log out</button>
              </div>
            ) : (
              <Link href="/account" className="hover:text-red-500 transition">Log in</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-6">
          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <span className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-black">
              Elite<span className="text-red-600">Sports</span>
            </span>
          </a>

          {/* Search */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-6">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for products"
                className="w-full pl-5 pr-12 py-2.5 text-sm border-2 border-gray-200 rounded-full focus:outline-none focus:border-red-600 transition"
              />
              <button onClick={handleSearch} className="absolute right-1 top-1/2 -translate-y-1/2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition" aria-label="Search">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 md:gap-5">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition" aria-label="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <Link
              href="/account"
              className="hidden md:flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-red-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="max-w-[120px] truncate" title={session?.user?.email || 'Account'}>
                {session?.user ? session.user.email : 'Account'}
              </span>
            </Link>

            <a href="/wishlist" className="hidden md:flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-red-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Wishlist
            </a>

            <button
              onClick={openCartDrawer}
              className="relative flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="hidden md:inline text-sm font-bold text-gray-700">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 right-0 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -mr-2 hover:bg-gray-100 rounded-full"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav className="hidden md:block bg-gray-900 text-white border-b-4 border-red-600 relative">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-1 flex-wrap">
            <li>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center gap-2 py-3.5 px-4 text-xs font-bold uppercase tracking-wide whitespace-nowrap hover:bg-red-600 transition"
                aria-label="All categories"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                All
              </button>
            </li>
            {categories.map((cat) => (
              <li
                key={cat.name}
                className="relative"
                onMouseEnter={() => {
                  setActiveCategory(cat.name)
                }}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <a
                  href={`/${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="block py-3.5 px-4 text-xs font-bold uppercase tracking-wide whitespace-nowrap hover:bg-red-600 transition"
                >
                  {cat.name}
                </a>
                {activeCategory === cat.name && activeCatData && (
                  <div className="absolute top-full left-0 w-64 bg-white text-gray-800 shadow-2xl border border-gray-200 z-50">
                    <p className="text-sm font-black uppercase tracking-wide text-gray-900 px-5 py-3 border-b border-gray-100">
                      {cat.name}
                    </p>
                    <ul className="py-2 max-h-[70vh] overflow-y-auto">
                      {activeCatData.items.map((item) => (
                        <li key={item.label} className="px-2">
                          <a
                            href={`/${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                            className="block px-3 py-2 text-sm font-semibold text-gray-800 hover:text-red-600 hover:bg-gray-50 rounded transition"
                          >
                            {item.label}
                          </a>
                          {item.children && (
                            <ul className="pl-4 pb-1">
                              {item.children.map((child) => (
                                <li key={child}>
                                  <a
                                    href={`/${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                    className="block px-3 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-gray-50 rounded transition"
                                  >
                                    {child}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}

          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="w-80 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col overflow-y-auto">
            <div className="p-4 bg-black text-white flex items-center justify-between">
              <span className="text-lg font-black uppercase tracking-tighter">All</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-full" aria-label="Close menu">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-2">
              <div className="border-b border-gray-100 pb-3 mb-2">
                {session?.user ? (
                  <div className="space-y-2">
                    <div className="px-2">
                      <p className="text-sm font-bold text-gray-900">Hi, {session.user.name || session.user.email}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                    </div>
                    <Link
                      href="/account"
                      className="block px-2 py-2 text-sm font-bold text-gray-800 hover:text-red-600 hover:bg-gray-50 rounded"
                    >
                      My Account
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-2 py-2 text-sm font-bold text-gray-800 hover:text-red-600 hover:bg-gray-50 rounded"
                    >
                      Log out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/account"
                    className="block px-2 py-2 text-sm font-bold text-gray-800 hover:text-red-600 hover:bg-gray-50 rounded"
                  >
                    Log in / Sign up
                  </Link>
                )}
              </div>
              {categories.map((cat) => (
                <div key={cat.name} className="border-b border-gray-100 last:border-0">
                  <button
                    onClick={() => {
                      setMobileActive(mobileActive === cat.name ? null : cat.name)
                    }}
                    className="w-full flex items-center justify-between py-3 px-2 text-sm font-bold uppercase text-gray-800"
                  >
                    {cat.name}
                    <svg
                      className={`w-4 h-4 transition-transform ${mobileActive === cat.name ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {mobileActive === cat.name && (
                    <div className="pb-2 pl-4 space-y-1">
                      {cat.items.map((item) => (
                        <div key={item.label}>
                          <a href={`/${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="block text-sm font-semibold text-gray-700 hover:text-red-600 py-1">
                            {item.label}
                          </a>
                          {item.children && (
                            <ul className="pl-3 pb-2 space-y-0.5">
                              {item.children.map((child) => (
                                <li key={child}>
                                  <a href={`/${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="block text-xs text-gray-500 hover:text-red-600 py-0.5">
                                    {child}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            </div>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  )
}
