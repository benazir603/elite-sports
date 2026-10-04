'use client'

import { useCart } from './CartProvider'
import type { CartItemInput } from './CartProvider'

interface AddToCartButtonProps {
  product: CartItemInput
  className?: string
}

export default function AddToCartButton({ product, className = '' }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  return (
    <button
      onClick={() => addToCart(product)}
      className={`${className} transition`}
    >
      Add to Cart
    </button>
  )
}
