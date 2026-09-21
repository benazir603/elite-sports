'use client'

import { useRouter } from 'next/navigation'
import { useCart } from './CartProvider'
import type { CartItem } from './CartProvider'

interface BuyNowButtonProps {
  product: Omit<CartItem, 'qty'>
  className?: string
}

export default function BuyNowButton({ product, className = '' }: BuyNowButtonProps) {
  const { addToCart } = useCart()
  const router = useRouter()

  return (
    <button
      onClick={() => {
        addToCart(product)
        router.push('/checkout')
      }}
      className={`${className} transition`}
    >
      Buy Now
    </button>
  )
}
