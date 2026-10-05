'use client'

import { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from 'react'
import { trackEvent } from '@/lib/analytics'

export interface CartItem {
  key: string
  id: number
  variationId?: number
  variation?: Record<string, string>
  name: string
  brand: string
  price: number
  image: string
  qty: number
}

export type CartItemInput = Omit<CartItem, 'key' | 'qty'>

interface CartContextValue {
  cart: CartItem[]
  cartCount: number
  cartTotal: number
  addToCart: (item: CartItemInput) => void
  updateQty: (key: string, change: number) => void
  removeFromCart: (key: string) => void
  clearCart: () => void
  isCartDrawerOpen: boolean
  openCartDrawer: () => void
  closeCartDrawer: () => void
}

const CART_KEY = 'elite-cart'

function getCartKey(item: Pick<CartItem, 'id' | 'variationId'>) {
  return `${item.id}:${item.variationId || 0}`
}

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem(CART_KEY)
  if (!saved) return []
  try {
    const items = JSON.parse(saved) as CartItem[]
    return Array.isArray(items) ? items.map((item) => ({ ...item, key: getCartKey(item) })) : []
  } catch {
    return []
  }
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setCart(loadCart())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated && typeof window !== 'undefined') {
      localStorage.setItem(CART_KEY, JSON.stringify(cart))
    }
  }, [cart, hydrated])

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart])
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart])

  const openCartDrawer = useCallback(() => setIsCartDrawerOpen(true), [])
  const closeCartDrawer = useCallback(() => setIsCartDrawerOpen(false), [])

  const addToCart = useCallback((item: CartItemInput) => {
    const key = getCartKey(item)
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.key === key)
      if (existing) {
        return prev.map((cartItem) => (cartItem.key === key ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem))
      }
      return [...prev, { ...item, key, qty: 1 }]
    })
    trackEvent('add_to_cart', {
      item_id: item.id,
      item_name: item.name,
      item_category: item.brand,
      price: item.price,
      variation_id: item.variationId,
    })
    setIsCartDrawerOpen(true)
  }, [])

  const updateQty = useCallback((key: string, change: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.key === key ? { ...item, qty: item.qty + change } : item))
        .filter((item) => item.qty > 0)
    )
  }, [])

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      cartTotal,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      isCartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
    }),
    [cart, cartCount, cartTotal, addToCart, updateQty, removeFromCart, clearCart, isCartDrawerOpen, openCartDrawer, closeCartDrawer]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
