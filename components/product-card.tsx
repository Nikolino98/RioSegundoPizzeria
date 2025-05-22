"use client"

import Image from "next/image"
import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity,
    })
    toast({
      title: "Producto agregado",
      description: `${product.name} se ha agregado al carrito`,
    })
  }

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg dark:border-gray-700">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="h-32 w-full sm:h-24 sm:w-24 flex-shrink-0">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="font-medium text-red-700 dark:text-red-500">${product.price.toFixed(2)}</div>
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="h-8 bg-red-700 hover:bg-red-800 dark:bg-red-800 dark:hover:bg-red-700"
              >
                <Plus className="mr-1 h-4 w-4" /> Agregar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
