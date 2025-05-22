"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { CartDrawer } from "./cart-drawer"

export function CartButton() {
  const { totalItems } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="icon" className="relative" onClick={() => setIsOpen(true)}>
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-700 text-xs text-white dark:bg-red-600">
            {totalItems}
          </span>
        )}
        <span className="sr-only">Abrir carrito</span>
      </Button>

      <CartDrawer open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
