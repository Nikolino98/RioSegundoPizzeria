"use client"

import { Button } from "@/components/ui/button"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { AdminTabs } from "@/components/admin/admin-tabs"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

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
  customer?: Customer
  items?: OrderItem[]
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

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    async function checkSession() {
      try {
        // Verificar si hay una sesión activa
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (!data.session) {
          // No hay sesión, redirigir a login
          router.push("/admin/login")
          return
        }

        // Guardar el usuario
        setUser(data.session.user)

        // Cargar productos
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })

        if (productsError) {
          console.error("Error fetching products:", productsError)
          toast({
            title: "Error",
            description: "No se pudieron cargar los productos",
            variant: "destructive",
          })
        } else {
          setProducts(productsData || [])
        }

        // Cargar pedidos
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })

        if (ordersError) {
          console.error("Error fetching orders:", ordersError)
          toast({
            title: "Error",
            description: "No se pudieron cargar los pedidos",
            variant: "destructive",
          })
        } else {
          // Cargar los items de cada pedido
          const ordersWithItems = await Promise.all(
            ordersData.map(async (order) => {
              const { data: items, error: itemsError } = await supabase
                .from("order_items")
                .select("*")
                .eq("order_id", order.id)

              if (itemsError) {
                console.error("Error fetching order items:", itemsError)
                return { ...order, items: [] }
              }

              return {
                ...order,
                customer: {
                  name: order.customer_name,
                  phone: order.customer_phone,
                  address: order.customer_address,
                },
                items: items.map((item) => ({
                  id: item.id,
                  name: item.product_name,
                  price: item.price,
                  quantity: item.quantity,
                })),
              }
            }),
          )

          setOrders(ordersWithItems || [])
        }
      } catch (error) {
        console.error("Error checking session:", error)
        toast({
          title: "Error de autenticación",
          description: "Por favor, inicia sesión nuevamente",
          variant: "destructive",
        })
        router.push("/admin/login")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router, toast])

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/admin/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-700" />
        <span className="ml-2">Cargando panel de administración...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <Button variant="outline" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>

      {user && <p className="mb-4">Bienvenido, {user.email}</p>}

      <AdminTabs products={products} orders={orders} />
    </div>
  )
}
