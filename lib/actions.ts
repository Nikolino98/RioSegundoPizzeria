"use server"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Customer {
  name: string
  phone: string
  email: string
  address: string
}

interface OrderData {
  customer: Customer
  items: OrderItem[]
  deliveryMethod: string
  paymentMethod: string
  notes: string
  total: number
}

export async function createOrder(orderData: OrderData) {
  try {
    // In a real application, you would save the order to a database here
    console.log("Creating order:", orderData)

    // Format WhatsApp message
    const items = orderData.items
      .map((item) => `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`)
      .join("%0A")

    const message =
      `*Nuevo Pedido de ${orderData.customer.name}*%0A%0A` +
      `*Productos:*%0A${items}%0A%0A` +
      `*Total:* $${orderData.total.toFixed(2)}%0A%0A` +
      `*Método de entrega:* ${orderData.deliveryMethod === "delivery" ? "Delivery" : "Retiro en local"}%0A` +
      `*Dirección:* ${orderData.customer.address}%0A` +
      `*Teléfono:* ${orderData.customer.phone}%0A` +
      `*Email:* ${orderData.customer.email}%0A` +
      `*Método de pago:* ${orderData.paymentMethod}%0A` +
      `*Notas:* ${orderData.notes || "Ninguna"}`

    // If payment method is Mercado Pago, create a payment preference
    if (orderData.paymentMethod === "mercadopago") {
      // This would be implemented with the Mercado Pago SDK
      // For now, we'll just simulate it
      console.log("Creating Mercado Pago preference")
    }

    // Send WhatsApp message - using the correct number format
    const whatsappUrl = `https://api.whatsapp.com/send?phone=3517716373&text=${message}`

    // Return the URL that will be used to open WhatsApp
    return { success: true, whatsappUrl }
  } catch (error) {
    console.error("Error creating order:", error)
    throw new Error("Failed to create order")
  }
}

// Admin actions for CRUD operations

export async function getProducts() {
  // In a real application, you would fetch products from a database
  // For now, we'll return mock data
  return [
    {
      id: "pizza-1",
      name: "Margherita",
      description: "Salsa de tomate, mozzarella fresca y albahaca",
      price: 12.99,
      image: "/pizza-1.jpg",
      category: "pizzas",
    },
    // More products...
  ]
}

export async function getOrders() {
  // In a real application, you would fetch orders from a database
  // For now, we'll return mock data
  return [
    {
      id: "order-1",
      customer: {
        name: "Juan Pérez",
        phone: "123456789",
        email: "juan@example.com",
        address: "Calle Principal 123",
      },
      items: [
        {
          id: "pizza-1",
          name: "Margherita",
          price: 12.99,
          quantity: 2,
        },
      ],
      deliveryMethod: "delivery",
      paymentMethod: "efectivo",
      status: "pending",
      total: 25.98,
      createdAt: new Date().toISOString(),
    },
    // More orders...
  ]
}

export async function updateProductAction(productData: any) {
  // In a real application, you would update the product in a database
  console.log("Updating product:", productData)
  return { success: true }
}

export async function createProductAction(productData: any) {
  // In a real application, you would create the product in a database
  console.log("Creating product:", productData)
  return { success: true, id: "new-product-id" }
}

export async function deleteProductAction(productId: string) {
  // In a real application, you would delete the product from a database
  console.log("Deleting product:", productId)
  return { success: true }
}

export async function updateOrderStatus(orderId: string, status: string) {
  // In a real application, you would update the order status in a database
  console.log("Updating order status:", orderId, status)
  return { success: true }
}
