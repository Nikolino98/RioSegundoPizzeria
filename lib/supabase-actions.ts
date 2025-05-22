"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { supabaseAdmin } from "./supabase-admin"

// Crear un cliente de Supabase para el servidor con cookies
async function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  })
}

// Tipos
export interface Product {
  id?: string
  name: string
  description: string
  price: number
  image: string
  category: string
  created_at?: string
  updated_at?: string
}

export interface Order {
  id?: string
  customer_name: string
  customer_phone: string
  customer_address: string
  delivery_method: string
  payment_method: string
  notes: string
  total: number
  status: string
  created_at?: string
  updated_at?: string
  items?: OrderItem[]
}

export interface OrderItem {
  id?: string
  order_id?: string
  product_id: string
  product_name: string
  price: number
  quantity: number
}

// Funciones para productos
export async function getProducts() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      throw new Error("Failed to fetch products")
    }

    return data || []
  } catch (error) {
    console.error("Error in getProducts:", error)
    return []
  }
}

export async function getProductsByCategory(category: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products by category:", error)
      throw new Error("Failed to fetch products by category")
    }

    return data || []
  } catch (error) {
    console.error("Error in getProductsByCategory:", error)
    return []
  }
}

export async function getProductById(id: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching product by id:", error)
      throw new Error("Failed to fetch product")
    }

    return data
  } catch (error) {
    console.error("Error in getProductById:", error)
    return null
  }
}

export async function createProduct(product: Product) {
  try {
    const { data, error } = await supabaseAdmin.from("products").insert([product]).select().single()

    if (error) {
      console.error("Error creating product:", error)
      throw new Error("Failed to create product")
    }

    revalidatePath("/admin")
    return { success: true, id: data.id }
  } catch (error) {
    console.error("Error in createProduct:", error)
    return { success: false, error: "Failed to create product" }
  }
}

export async function updateProduct(product: Product) {
  try {
    const { error } = await supabaseAdmin
      .from("products")
      .update({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
      })
      .eq("id", product.id)

    if (error) {
      console.error("Error updating product:", error)
      throw new Error("Failed to update product")
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in updateProduct:", error)
    return { success: false, error: "Failed to update product" }
  }
}

export async function deleteProduct(id: string) {
  try {
    // Primero, intentamos eliminar la imagen asociada si existe
    const { data: product } = await supabaseAdmin.from("products").select("image").eq("id", id).single()

    if (product && product.image && product.image.includes("storage.googleapis.com")) {
      // Extraer el path de la imagen desde la URL
      const imagePath = product.image.split("/").slice(-2).join("/")

      if (imagePath) {
        await supabaseAdmin.storage.from("images").remove([imagePath])
      }
    }

    // Luego eliminamos el producto
    const { error } = await supabaseAdmin.from("products").delete().eq("id", id)

    if (error) {
      console.error("Error deleting product:", error)
      throw new Error("Failed to delete product")
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteProduct:", error)
    return { success: false, error: "Failed to delete product" }
  }
}

// Funciones para subir imágenes
export async function uploadProductImage(file: File) {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError, data } = await supabaseAdmin.storage.from("images").upload(filePath, file)

    if (uploadError) {
      console.error("Error uploading image:", uploadError)
      throw new Error("Failed to upload image")
    }

    // Obtener la URL pública de la imagen
    const { data: urlData } = supabaseAdmin.storage.from("images").getPublicUrl(filePath)

    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error("Error in uploadProductImage:", error)
    return { success: false, error: "Failed to upload image" }
  }
}

// Funciones para pedidos
export async function getOrders() {
  try {
    const supabase = await createServerSupabaseClient()
    // Obtener todos los pedidos
    const { data: orders, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      throw new Error("Failed to fetch orders")
    }

    // Para cada pedido, obtener sus items
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
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
            email: "", // No almacenamos email según lo solicitado
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

    return ordersWithItems || []
  } catch (error) {
    console.error("Error in getOrders:", error)
    return []
  }
}

export async function createOrder(orderData: any) {
  try {
    // Crear el pedido
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          customer_name: orderData.customer.name,
          customer_phone: orderData.customer.phone,
          customer_address: orderData.customer.address,
          delivery_method: orderData.deliveryMethod,
          payment_method: orderData.paymentMethod,
          notes: orderData.notes,
          total: orderData.total,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating order:", error)
      throw new Error("Failed to create order")
    }

    // Crear los items del pedido
    const orderItems = orderData.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      price: item.price,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      throw new Error("Failed to create order items")
    }

    // Format WhatsApp message
    const items = orderData.items
      .map((item: any) => `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`)
      .join("%0A")

    const message =
      `*Nuevo Pedido de ${orderData.customer.name}*%0A%0A` +
      `*Productos:*%0A${items}%0A%0A` +
      `*Total:* $${orderData.total.toFixed(2)}%0A%0A` +
      `*Método de entrega:* ${orderData.deliveryMethod === "delivery" ? "Delivery" : "Retiro en local"}%0A` +
      `*Dirección:* ${orderData.customer.address}%0A` +
      `*Teléfono:* ${orderData.customer.phone}%0A` +
      `*Método de pago:* ${orderData.paymentMethod}%0A` +
      `*Notas:* ${orderData.notes || "Ninguna"}`

    // Send WhatsApp message
    const whatsappUrl = `https://api.whatsapp.com/send?phone=3517716373&text=${message}`

    return { success: true, whatsappUrl }
  } catch (error) {
    console.error("Error in createOrder:", error)
    return { success: false, error: "Failed to create order" }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", orderId)

    if (error) {
      console.error("Error updating order status:", error)
      throw new Error("Failed to update order status")
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in updateOrderStatus:", error)
    return { success: false, error: "Failed to update order status" }
  }
}

// Funciones de autenticación
export async function signIn(email: string, password: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Error signing in:", error)
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Error in signIn:", error)
    return { success: false, error: "Failed to sign in" }
  }
}

export async function signOut() {
  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error signing out:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in signOut:", error)
    return { success: false, error: "Failed to sign out" }
  }
}

export async function getSession() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error)
      return null
    }

    return data.session
  } catch (error) {
    console.error("Error in getSession:", error)
    return null
  }
}
