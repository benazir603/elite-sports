'use client'

import { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from 'react'

export interface CartItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  qty: number
}

interface CartContextValue {
  cart: CartItem[]
  cartCount: number
  cartTotal: number
  addToCart: (item: Omit<CartItem, 'qty'>) => void
  updateQty: (id: number, change: number) => void
  removeFromCart: (id: number) => void
  clearCart: () => void
  isCartDrawerOpen: boolean
  openCartDrawer: () => void
  closeCartDrawer: () => void
}

const CART_KEY = 'elite-cart'

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem(CART_KEY)
  if (!saved) return []
  try {
    return JSON.parse(saved) as CartItem[]
  } catch {
    return []
  }
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)

  useEffect(() => {
    setCart(loadCart())
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_KEY, JSON.stringify(cart))
    }
  }, [cart])

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart])
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart])

  const openCartDrawer = useCallback(() => setIsCartDrawerOpen(true), [])
  const closeCartDrawer = useCallback(() => setIsCartDrawerOpen(false), [])

  const addToCart = useCallback(
    (item: Omit<CartItem, 'qty'>) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === item.id)
        if (existing) {
          return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
        }
        return [...prev, { ...item, qty: 1 }]
      })
      setIsCartDrawerOpen(true)
    },
    []
  )

  const updateQty = useCallback((id: number, change: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + change } : item))
        .filter((item) => item.qty > 0)
    )
  }, [])

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
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
