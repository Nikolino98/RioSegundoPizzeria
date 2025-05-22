"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { updateOrderStatus } from "@/lib/supabase-actions"

interface OrdersTableProps {
  orders: any[]
  onStatusUpdate: (orderId: string, status: string) => void
}

export function OrdersTable({ orders, onStatusUpdate }: OrdersTableProps) {
  const { toast } = useToast()
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleViewDetails = (order: any) => {
    setCurrentOrder(order)
    setIsDetailsDialogOpen(true)
  }

  const handleStatusChange = async (orderId: string, status: string) => {
    setLoading(true)

    try {
      const result = await updateOrderStatus(orderId, status)

      if (result.success) {
        onStatusUpdate(orderId, status)

        toast({
          title: "Estado actualizado",
          description: "El estado del pedido se ha actualizado correctamente",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo actualizar el estado del pedido",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pendiente
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            En proceso
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Completado
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Gestión de Pedidos</h2>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Método de Pago</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                <TableCell>{order.customer_name || order.customer?.name}</TableCell>
                <TableCell>{format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell className="capitalize">{order.payment_method}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>
                    Ver Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido</DialogTitle>
          </DialogHeader>
          {currentOrder && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Información del Cliente</h3>
                <div className="mt-2 space-y-1">
                  <p>
                    <strong>Nombre:</strong> {currentOrder.customer_name || currentOrder.customer?.name}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {currentOrder.customer_phone || currentOrder.customer?.phone}
                  </p>
                  <p>
                    <strong>Dirección:</strong> {currentOrder.customer_address || currentOrder.customer?.address}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Productos</h3>
                <div className="mt-2 space-y-2">
                  {currentOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.product_name || item.name}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 font-medium">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span>${currentOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Detalles del Pedido</h3>
                <div className="mt-2 space-y-1">
                  <p>
                    <strong>Método de entrega:</strong>{" "}
                    {currentOrder.delivery_method === "delivery" ? "Delivery" : "Retiro en local"}
                  </p>
                  <p>
                    <strong>Método de pago:</strong> {currentOrder.payment_method}
                  </p>
                  <p>
                    <strong>Estado:</strong> {getStatusBadge(currentOrder.status)}
                  </p>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {format(new Date(currentOrder.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                  </p>
                  {currentOrder.notes && (
                    <p>
                      <strong>Notas:</strong> {currentOrder.notes}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Cambiar Estado</h3>
                <div className="mt-2">
                  <Select
                    value={currentOrder.status}
                    onValueChange={(value) => handleStatusChange(currentOrder.id, value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="processing">En proceso</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
