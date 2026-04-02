"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { Course } from "@/lib/types"

interface CartContextType {
  items: Course[]
  addToCart: (course: Course) => void
  removeFromCart: (courseId: string) => void
  isInCart: (courseId: string) => boolean
  clearCart: () => void
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  isInCart: () => false,
  clearCart: () => {},
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Course[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bcd_cart")
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem("bcd_cart", JSON.stringify(items))
  }, [items])

  const addToCart = (course: Course) => {
    setItems(prev =>
      prev.find(c => c.id === course.id) ? prev : [...prev, course]
    )
  }

  const removeFromCart = (courseId: string) => {
    setItems(prev => prev.filter(c => c.id !== courseId))
  }

  const isInCart = (courseId: string) => items.some(c => c.id === courseId)

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, isInCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
