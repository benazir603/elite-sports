'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { CartProvider } from './components/CartProvider'
import CartDrawer from './components/CartDrawer'
import { MenuProvider } from './components/MenuProvider'
import type { MenuCategory } from '@/lib/catalog'

export function Providers({ children, menu }: { children: ReactNode; menu: MenuCategory[] }) {
  return (
    <SessionProvider>
      <MenuProvider menu={menu}>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </MenuProvider>
    </SessionProvider>
  )
}
