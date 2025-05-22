"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductsTable } from "./products-table"
import { OrdersTable } from "./orders-table"

// Definir interfaces para los tipos de datos
interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  created_at?: string
  updated_at?: string
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Customer {
  name: string
  phone: string
  address: string
  email?: string
}

interface Order {
  id: string
  customer: Customer
  items: OrderItem[]
  delivery_method?: string
  payment_method?: string
  deliveryMethod?: string
  paymentMethod?: string
  notes?: string
  status: string
  total: number
  created_at?: string
  customer_name?: string
  customer_phone?: string
  customer_address?: string
}

interface AdminTabsProps {
  products: Product[]
  orders: Order[]
}

export function AdminTabs({ products: initialProducts, orders: initialOrders }: AdminTabsProps) {
  // Proporcionar tipos explícitos a los estados
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [orders, setOrders] = useState<Order[]>(initialOrders)

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)),
    )
  }

  const handleProductCreate = (newProduct: Product) => {
    setProducts((prevProducts) => [...prevProducts, newProduct])
  }

  const handleProductDelete = (productId: string) => {
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId))
  }

  const handleOrderStatusUpdate = (orderId: string, status: string) => {
    setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status } : order)))
  }

  return (
    <Tabs defaultValue="products">
      <TabsList className="mb-6 grid w-full grid-cols-2">
        <TabsTrigger value="products">Productos</TabsTrigger>
        <TabsTrigger value="orders">Pedidos</TabsTrigger>
      </TabsList>

      <TabsContent value="products">
        <ProductsTable
          products={products}
          onUpdate={handleProductUpdate}
          onCreate={handleProductCreate}
          onDelete={handleProductDelete}
        />
      </TabsContent>

      <TabsContent value="orders">
        <OrdersTable orders={orders} onStatusUpdate={handleOrderStatusUpdate} />
      </TabsContent>
    </Tabs>
  )
}
