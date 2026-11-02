'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { MenuCategory } from '@/lib/catalog'

const MenuContext = createContext<MenuCategory[]>([])

export function MenuProvider({ menu, children }: { menu: MenuCategory[]; children: ReactNode }) {
  return <MenuContext value={menu}>{children}</MenuContext>
}

export function useMenu() {
  return useContext(MenuContext)
}
