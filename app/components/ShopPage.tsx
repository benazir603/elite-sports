'use client'

import { useState, useEffect } from 'react'
import Header from './Header'
import { useCart } from './CartProvider'

interface Product {
  id: number
  name: string
  category: string
  price: number
  image: string
}

interface WooCommerceProduct {
  id: number
  name: string
  price: string
  regular_price: string
  images: { src: string }[]
  categories: { name: string }[]
}

const localProducts: Product[] = [
  { id: 1, name: 'Nike Air Zoom Pegasus 40', category: 'Running', price: 140, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Adidas Ultraboost Light', category: 'Running', price: 190, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a1?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Jordan 1 Retro High OG', category: 'Lifestyle', price: 180, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Under Armour Curry 10', category: 'Basketball', price: 160, image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80' },
  { id: 5, name: 'Puma RS-X Bold', category: 'Lifestyle', price: 120, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80' },
  { id: 6, name: 'New Balance 990v6', category: 'Running', price: 200, image: 'https://images.unsplash.com/photo-1549298916-b41d94d566b2?auto=format&fit=crop&w=600&q=80' },
  { id: 7, name: 'Nike LeBron 20', category: 'Basketball', price: 200, image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=600&q=80' },
  { id: 8, name: 'Converse Chuck 70 Plus', category: 'Lifestyle', price: 95, image: 'https://placehold.co/600x400/1f2937/ffffff?text=Converse+Chuck+70' },
]

function formatMoney(amount: number) {
  return '₹' + amount.toFixed(2)
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState('all')
  const [currentSlide, setCurrentSlide] = useState(0)
  const { addToCart: addToCartContext } = useCart()

  useEffect(() => {
    setProducts(localProducts)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const filteredProducts = filter === 'all' ? products : products.filter((p) => p.category === filter)

  function addToCart(id: number) {
    const product = products.find((p) => p.id === id)
    if (!product) return
    addToCartContext({
      id: product.id,
      name: product.name,
      brand: (product as any).brand || product.category || 'Elite',
      price: product.price,
      image: product.image,
    })
  }

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

      {/* Shop */}
      <section id="shop" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div>
              <p className="text-red-600 font-bold uppercase tracking-widest text-sm mb-2">Shop the Best</p>
              <h2 className="text-3xl md:text-4xl font-black">Trending Footwear</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'Running', 'Basketball', 'Lifestyle'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full border transition ${
                    filter === cat
                      ? 'bg-black text-white border-black'
                      : 'border-gray-200 hover:border-black text-gray-700'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition duration-300"
              >
                <div className="relative overflow-hidden h-64 bg-gray-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/600x400/eeeeee/333333?text=${encodeURIComponent(product.name)}`
                    }}
                  />
                  <span className="absolute top-3 left-3 bg-white/90 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1 leading-tight">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">Premium performance</p>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xl">{formatMoney(product.price)}</span>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="bg-black hover:bg-red-600 text-white text-sm font-bold py-2.5 px-5 rounded-full transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

      {/* Newsletter */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-3">Join the Elite Team</h2>
          <p className="text-gray-500 mb-8">Get early access to new drops, exclusive offers, and training tips.</p>
          <form
            className="flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              alert('Thanks for subscribing!')
            }}
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-red-600"
            />
            <button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full transition"
            >
              Subscribe
            </button>
          </form>
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
              <li>+1 (555) 123-4567</li>
              <li>123 Athlete Ave, New York, NY</li>
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
