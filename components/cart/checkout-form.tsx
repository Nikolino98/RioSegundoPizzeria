"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface CheckoutFormProps {
  onBack: () => void
}

// Función para verificar si un string es un UUID válido
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function CheckoutForm({ onBack }: CheckoutFormProps) {
  const { items, totalPrice, clearCart } = useCart()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    deliveryMethod: "delivery",
    paymentMethod: "efectivo",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Verificar que hay productos en el carrito
      if (items.length === 0) {
        throw new Error("No hay productos en el carrito")
      }

      // Crear datos del pedido
      const orderData = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.deliveryMethod === "delivery" ? formData.address : "Retiro en local",
        delivery_method: formData.deliveryMethod,
        payment_method: formData.paymentMethod,
        notes: formData.notes,
        total: totalPrice,
        status: "pending",
      }

      console.log("Enviando datos del pedido:", orderData)

      // Insertar pedido en la base de datos
      const { data: order, error: orderError } = await supabase.from("orders").insert([orderData]).select().single()

      if (orderError) {
        console.error("Error al crear el pedido:", orderError)
        throw new Error(`Error al crear el pedido: ${orderError.message}`)
      }

      if (!order || !order.id) {
        throw new Error("No se pudo crear el pedido: ID no disponible")
      }

      console.log("Pedido creado:", order)

      // Crear items del pedido, omitiendo product_id si no es un UUID válido
      const orderItems = items.map((item) => {
        const orderItem: any = {
          order_id: order.id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
        }

        // Solo incluir product_id si es un UUID válido
        if (isValidUUID(item.id)) {
          orderItem.product_id = item.id
        }

        return orderItem
      })

      console.log("Enviando items del pedido:", orderItems)

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("Error al crear los items del pedido:", itemsError)
        throw new Error(`Error al crear los items del pedido: ${itemsError.message}`)
      }

      // Formatear mensaje de WhatsApp
      const itemsText = items
        .map((item) => `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`)
        .join("%0A")

      const message =
        `*Nuevo Pedido de ${formData.name}*%0A%0A` +
        `*Productos:*%0A${itemsText}%0A%0A` +
        `*Total:* $${totalPrice.toFixed(2)}%0A%0A` +
        `*Método de entrega:* ${formData.deliveryMethod === "delivery" ? "Delivery" : "Retiro en local"}%0A` +
        `*Dirección:* ${formData.deliveryMethod === "delivery" ? formData.address : "Retiro en local"}%0A` +
        `*Teléfono:* ${formData.phone}%0A` +
        `*Método de pago:* ${formData.paymentMethod}%0A` +
        `*Notas:* ${formData.notes || "Ninguna"}`

      // Abrir WhatsApp con los detalles del pedido
      const whatsappUrl = `https://api.whatsapp.com/send?phone=3517716373&text=${message}`

      // Usar setTimeout para asegurar que la ventana se abra después de que el estado se actualice
      setTimeout(() => {
        window.open(whatsappUrl, "_blank")
      }, 500)

      // Mostrar mensaje de éxito
      setSuccess(true)
      clearCart()

      toast({
        title: "¡Pedido realizado con éxito!",
        description: "Se ha abierto WhatsApp con los detalles de tu pedido.",
      })
    } catch (error) {
      console.error("Error processing order:", error)
      toast({
        title: "Error al procesar el pedido",
        description:
          error instanceof Error ? error.message : "Por favor intenta nuevamente o contáctanos directamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mt-4 text-lg font-medium">¡Pedido realizado con éxito!</h3>
        <p className="mt-2 text-gray-500">Gracias por tu pedido. Recibirás una confirmación por WhatsApp en breve.</p>
        <Button className="mt-6 bg-red-700 hover:bg-red-800" onClick={onBack}>
          Volver al Menú
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <Button type="button" variant="ghost" className="mb-4 pl-0" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al carrito
      </Button>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información de contacto</h3>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Método de entrega</h3>

        <RadioGroup
          value={formData.deliveryMethod}
          onValueChange={(value) => handleRadioChange("deliveryMethod", value)}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="delivery" id="delivery" />
            <Label htmlFor="delivery">Delivery</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pickup" id="pickup" />
            <Label htmlFor="pickup">Retiro en local</Label>
          </div>
        </RadioGroup>

        {formData.deliveryMethod === "delivery" && (
          <div className="space-y-2">
            <Label htmlFor="address">Dirección de entrega</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required={formData.deliveryMethod === "delivery"}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Método de pago</h3>

        <RadioGroup
          value={formData.paymentMethod}
          onValueChange={(value) => handleRadioChange("paymentMethod", value)}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="efectivo" id="efectivo" />
            <Label htmlFor="efectivo">Efectivo</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="transferencia" id="transferencia" />
            <Label htmlFor="transferencia">Transferencia bancaria</Label>
          </div>
        </RadioGroup>

        {formData.paymentMethod === "transferencia" && (
          <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-medium">Datos para transferencia:</p>
            <p className="mt-1">Alias: RIOSEGUNDO.PIZZERIA</p>
            <p className="mt-2 font-medium">No olvides enviarnos tu comprobante de pago por WhatsApp.</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas adicionales</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Instrucciones especiales, alergias, etc."
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between font-medium">
          <span>Total a pagar</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>

        <Button type="submit" className="w-full bg-red-700 hover:bg-red-800" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
            </>
          ) : (
            "Confirmar Pedido"
          )}
        </Button>
      </div>
    </form>
  )
}
