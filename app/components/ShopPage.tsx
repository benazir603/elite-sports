'use client'

import { useState, useEffect } from 'react'
import Header from './Header'

export default function ShopPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <Header />

      {/* Hero Slider */}
      <section className="relative w-full h-[400px] md:h-[520px] overflow-hidden bg-black">
        {[
          {
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
            title: 'Dominate the Court',
            subtitle: 'Elite basketball and court shoes engineered for champions.',
            cta: 'Shop Basketball',
          },
          {
            image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80',
            title: 'Run Like the Wind',
            subtitle: 'Track, field and running gear for every stride.',
            cta: 'Shop Running',
          },
          {
            image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80',
            title: 'Train Without Limits',
            subtitle: 'Professional gym and training equipment for your best performance.',
            cta: 'Shop Training',
          },
        ].map((slide, index) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = 'https://placehold.co/1600x800/111827/ffffff?text=Elite+Sports')}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 w-full">
                <div className="max-w-xl text-white">
                  <p className="text-red-400 font-bold mb-3 uppercase tracking-widest text-sm">Pro Performance</p>
                  <h2 className="text-4xl md:text-6xl font-black leading-[1.05] mb-4">{slide.title}</h2>
                  <p className="text-gray-200 text-lg mb-8 leading-relaxed">{slide.subtitle}</p>
                  <a
                    href="#shop"
                    className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-8 rounded-full transition shadow-lg shadow-red-900/30"
                  >
                    {slide.cta}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur transition"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur transition"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full transition ${i === currentSlide ? 'bg-red-600' : 'bg-white/50 hover:bg-white'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { title: 'Free Shipping', desc: 'On all orders over ₹8,300', path: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
            { title: 'Authentic Guarantee', desc: '100% verified products', path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { title: 'Easy Returns', desc: '30-day return policy', path: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
            { title: 'Expert Support', desc: 'Live chat 24/7', path: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center">
              <svg className="w-8 h-8 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.path} />
              </svg>
              <h3 className="font-bold text-sm uppercase tracking-wide">{item.title}</h3>
              <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by sport */}
      <section id="shop" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-red-600 font-bold uppercase tracking-widest text-sm mb-2">Shop by Sport</p>
            <h2 className="text-3xl md:text-4xl font-black">Find Your Game</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Premium gear for every athlete — from the pitch to the court.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Cricket',
                href: '/cricket',
                image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
                tag: 'Bats, Balls & Protective Gear',
              },
              {
                name: 'Badminton',
                href: '/badminton',
                image: 'https://images.unsplash.com/photo-1626224583764-8478ab2e1538?auto=format&fit=crop&w=800&q=80',
                tag: 'Rackets & Shuttlecocks',
              },
              {
                name: 'Football',
                href: '/football',
                image: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=800&q=80',
                tag: 'Balls, Studs & Kits',
              },
              {
                name: 'Basketball',
                href: '/basketball',
                image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
                tag: 'Balls & Court Essentials',
              },
              {
                name: 'Fitness & Gym',
                href: '/fitness',
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
                tag: 'Dumbbells, Bands & More',
              },
              {
                name: 'Table Tennis',
                href: '/table-tennis',
                image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80',
                tag: 'Bats, Balls & Rubbers',
              },
            ].map((sport) => (
              <a
                key={sport.name}
                href={sport.href}
                className="group relative h-72 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-300"
              >
                <img
                  src={sport.image}
                  alt={sport.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110"
                  onError={(e) => (e.currentTarget.src = `https://placehold.co/800x600/1f2937/ffffff?text=${encodeURIComponent(sport.name)}`)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">{sport.tag}</p>
                  <div className="flex items-center justify-between">
                    <h3 className="text-white text-2xl font-black uppercase tracking-tight">{sport.name}</h3>
                    <span className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition">
                      Shop Now
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured collections */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-red-600 font-bold uppercase tracking-widest text-sm mb-2">Featured</p>
            <h2 className="text-3xl md:text-4xl font-black">This Season's Picks</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <a
              href="/badminton"
              className="group relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition"
            >
              <img
                src="https://images.unsplash.com/photo-1613918228405-96e96ff524de?auto=format&fit=crop&w=1000&q=80"
                alt="Badminton essentials"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
                onError={(e) => (e.currentTarget.src = 'https://placehold.co/1000x600/1f2937/ffffff?text=Badminton+Essentials')}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex items-center p-10">
                <div className="max-w-sm">
                  <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">Court Ready</p>
                  <h3 className="text-white text-3xl font-black mb-3">Badminton Essentials</h3>
                  <p className="text-gray-300 text-sm mb-6">Lightweight rackets, feather shuttlecocks and grip that wins rallies.</p>
                  <span className="inline-flex items-center bg-red-600 text-white font-bold text-sm px-6 py-3 rounded-full group-hover:bg-red-700 transition">
                    Shop Badminton
                  </span>
                </div>
              </div>
            </a>

            <a
              href="/cricket"
              className="group relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition"
            >
              <img
                src="https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=1000&q=80"
                alt="Cricket gear"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
                onError={(e) => (e.currentTarget.src = 'https://placehold.co/1000x600/1f2937/ffffff?text=Cricket+Gear')}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex items-center p-10">
                <div className="max-w-sm">
                  <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">Match Winners</p>
                  <h3 className="text-white text-3xl font-black mb-3">Cricket Gear</h3>
                  <p className="text-gray-300 text-sm mb-6">English willow bats, leather balls and pro-grade protection.</p>
                  <span className="inline-flex items-center bg-red-600 text-white font-bold text-sm px-6 py-3 rounded-full group-hover:bg-red-700 transition">
                    Shop Cricket
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Sale banner */}
      <section className="py-20 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="uppercase tracking-widest text-sm font-bold text-red-200 mb-2">Limited Time</p>
            <h2 className="text-3xl md:text-5xl font-black leading-tight">Season Sale — Up to 40% Off</h2>
            <p className="text-red-100 mt-3 max-w-lg">Grab pro-level gear at unbeatable prices. On selected rackets, bats, shoes and apparel.</p>
          </div>
          <a
            href="/badminton"
            className="flex-shrink-0 bg-white text-red-600 font-black uppercase tracking-wide px-10 py-4 rounded-full hover:bg-gray-100 transition shadow-lg"
          >
            Shop the Sale
          </a>
        </div>
      </section>

      {/* Promo */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <img
            src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80"
            alt="Sneaker collection"
            className="rounded-2xl shadow-2xl w-full"
            onError={(e) => (e.currentTarget.src = 'https://placehold.co/800x600/111827/ffffff?text=New+Collection')}
          />
          <div>
            <p className="text-red-500 font-bold uppercase tracking-widest text-sm mb-2">New Drop</p>
            <h2 className="text-4xl md:text-5xl font-black mb-6">Court Royalty Collection</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Dominate every game with lightweight uppers, responsive cushioning, and grip that keeps you in control. Limited stock available for this season.
            </p>
            <a
              href="#shop"
              className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition"
            >
              Shop Collection
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div>
            <a href="/" className="text-2xl font-black tracking-tighter uppercase block mb-4">
              Elite<span className="text-red-600">Sports</span>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium performance sneakers and athletic gear for athletes who refuse to settle for average.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Shop</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#shop" className="hover:text-white transition">Men</a></li>
              <li><a href="#shop" className="hover:text-white transition">Women</a></li>
              <li><a href="#shop" className="hover:text-white transition">Kids</a></li>
              <li><a href="#shop" className="hover:text-white transition">New Arrivals</a></li>
              <li><a href="#shop" className="hover:text-white transition">Sale</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Help</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/contact" className="hover:text-white transition">Contact Us</a></li>
              <li><a href="/shipping" className="hover:text-white transition">Shipping Info</a></li>
              <li><a href="/returns" className="hover:text-white transition">Returns & Exchanges</a></li>
              <li><a href="/size-guide" className="hover:text-white transition">Size Guide</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>elitesportselaiyur@gmail.com</li>
              <li>+91 95000 30150</li>
              <li>No 6, Mohan Complex, Tambaram Eastern Bypass Rd, Tiruvanchery, Selaiyur, Chennai, Puthur, Tamil Nadu 600126</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 max-w-7xl mx-auto px-4 pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-gray-500 text-sm">
          <span>&copy; 2026 Elite Sports. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="/privacy-policy" className="hover:text-white transition">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </footer>

    </>
  )
}
