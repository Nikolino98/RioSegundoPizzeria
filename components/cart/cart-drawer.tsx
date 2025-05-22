"use client"

import { useState } from "react"
import Image from "next/image"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { CheckoutForm } from "./checkout-form"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  if (items.length === 0) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Tu Carrito
            </SheetTitle>
          </SheetHeader>
          <div className="mt-8 flex h-full flex-col items-center justify-center">
            <div className="rounded-full bg-gray-100 p-6">
              <ShoppingCart className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Tu carrito está vacío</h3>
            <p className="mt-2 text-center text-gray-500">
              Agrega algunos productos deliciosos para comenzar tu pedido
            </p>
            <Button className="mt-6 bg-red-700 hover:bg-red-800" onClick={onClose}>
              Explorar Menú
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Tu Carrito
          </SheetTitle>
        </SheetHeader>

        {isCheckingOut ? (
          <CheckoutForm onBack={() => setIsCheckingOut(false)} />
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start space-x-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{item.name}</h4>
                    <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)}</p>
                    <div className="mt-2 flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="mx-2 w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <Button className="w-full bg-red-700 hover:bg-red-800" onClick={() => setIsCheckingOut(true)}>
                Proceder al Pago
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
