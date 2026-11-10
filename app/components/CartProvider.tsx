'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback, ReactNode } from 'react'
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

interface StockResponseItem {
  key: string
  available: number | null
  max: number
  purchasable: boolean
  variationId?: number
  variation?: Record<string, string>
  price?: number
  message?: string
}

interface CartContextValue {
  cart: CartItem[]
  cartCount: number
  cartTotal: number
  /** item key → max purchasable quantity (from WooCommerce; MAX_ORDER_QUANTITY when untracked). */
  limits: Record<string, number>
  /** item key → customer-facing stock error (e.g. "Only 3 items are available in stock."). */
  stockIssues: Record<string, string>
  checkingStock: boolean
  addToCart: (item: CartItemInput) => Promise<string | undefined>
  updateQty: (key: string, change: number) => void
  removeFromCart: (key: string) => void
  clearCart: () => void
  refreshStock: () => Promise<void>
  isCartDrawerOpen: boolean
  openCartDrawer: () => void
  closeCartDrawer: () => void
}

const CART_KEY = 'elite-cart'

export function getCartKey(item: Pick<CartItem, 'id' | 'variationId'>) {
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

async function fetchStockLimits(items: Pick<CartItem, 'id' | 'variationId'>[]) {
  const res = await fetch('/api/stock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: items.map((item) => ({ id: item.id, variationId: item.variationId })) }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return (data.items || []) as StockResponseItem[]
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [limits, setLimits] = useState<Record<string, number>>({})
  const [stockIssues, setStockIssues] = useState<Record<string, string>>({})
  const [checkingStock, setCheckingStock] = useState(false)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const cartRef = useRef<CartItem[]>(cart)
  useEffect(() => {
    cartRef.current = cart
  }, [cart])

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

  const refreshStock = useCallback(async () => {
    setCart((current) => {
      if (current.length === 0) {
        setLimits({})
        setStockIssues({})
        return current
      }
      setCheckingStock(true)
      fetchStockLimits(current)
        .then((items) => {
          if (!items) return
          const newLimits: Record<string, number> = {}
          const issues: Record<string, string> = {}
          for (const info of items) {
            newLimits[info.key] = info.max
            const requested = current.find((item) => item.key === info.key)?.qty || 0
            if (!info.purchasable) issues[info.key] = 'Out of stock'
            else if (requested > info.max) issues[info.key] = `Only ${info.max} ${info.max === 1 ? 'item is' : 'items are'} available in stock.`
          }
          setLimits(newLimits)
          setStockIssues(issues)
          setCart((prev) =>
            prev
              .map((item) => {
                const max = newLimits[item.key]
                return max !== undefined && item.qty > max ? { ...item, qty: max } : item
              })
              .filter((item) => item.qty > 0)
          )
        })
        .catch(() => {})
        .finally(() => setCheckingStock(false))
      return current
    })
  }, [])

  const addToCart = useCallback(async (item: CartItemInput): Promise<string | undefined> => {
    const stock = await fetchStockLimits([item]).catch(() => null)
    const info = stock?.[0]
    // For variable products added without a variation (e.g. collection grids),
    // /api/stock resolves the first purchasable in-stock variation for us.
    if (!item.variationId && info?.variationId) {
      item = {
        ...item,
        variationId: info.variationId,
        variation: info.variation,
        price: info.price ?? item.price,
      }
    }
    const key = getCartKey(item)
    const max = info?.max ?? limits[key] ?? 20

    const existingQty = cartRef.current.find((cartItem) => cartItem.key === key)?.qty || 0
    let error: string | undefined
    if (info && !info.purchasable) error = 'Out of stock'
    else if (existingQty >= max) error = `Only ${max} ${max === 1 ? 'item is' : 'items are'} available in stock.`

    if (!error) {
      setCart((prev) => {
        const existing = prev.find((cartItem) => cartItem.key === key)
        if (existing) {
          return prev.map((cartItem) => (cartItem.key === key ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem))
        }
        return [...prev, { ...item, key, qty: 1 }]
      })
    }

    setLimits((prev) => ({ ...prev, [key]: max }))
    if (error) {
      setStockIssues((prev) => ({ ...prev, [key]: error! }))
      setIsCartDrawerOpen(true)
      return error
    }
    setStockIssues((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
    trackEvent('add_to_cart', {
      item_id: item.id,
      item_name: item.name,
      item_brand: item.brand || undefined,
      price: item.price,
      variation_id: item.variationId,
    })
    setIsCartDrawerOpen(true)
    return undefined
  }, [limits])

  const updateQty = useCallback((key: string, change: number) => {
    const max = limits[key] ?? 20
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.key !== key) return item
          const next = Math.min(item.qty + change, max)
          if (change > 0 && item.qty + change > max) {
            setStockIssues((issues) => ({ ...issues, [key]: `Only ${max} ${max === 1 ? 'item is' : 'items are'} available in stock.` }))
          } else {
            setStockIssues((issues) => {
              if (!issues[key]) return issues
              const nextIssues = { ...issues }
              delete nextIssues[key]
              return nextIssues
            })
          }
          return { ...item, qty: next }
        })
        .filter((item) => item.qty > 0)
    )
  }, [limits])

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key))
    setStockIssues((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setLimits({})
    setStockIssues({})
  }, [])

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      cartTotal,
      limits,
      stockIssues,
      checkingStock,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      refreshStock,
      isCartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
    }),
    [cart, cartCount, cartTotal, limits, stockIssues, checkingStock, addToCart, updateQty, removeFromCart, clearCart, refreshStock, isCartDrawerOpen, openCartDrawer, closeCartDrawer]
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
