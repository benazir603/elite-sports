'use client'

import { useRouter } from 'next/navigation'
import { useCart } from './CartProvider'
import type { CartItemInput } from './CartProvider'

interface BuyNowButtonProps {
  product: CartItemInput
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
