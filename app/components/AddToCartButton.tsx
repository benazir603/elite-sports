'use client'

import { useCart } from './CartProvider'
import type { CartItem } from './CartProvider'

interface AddToCartButtonProps {
  product: Omit<CartItem, 'qty'>
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
