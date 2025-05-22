"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export function LogoutButton() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast({
          title: "Error",
          description: error.message || "No se pudo cerrar sesión",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión correctamente",
        })

        // Forzar recarga completa para limpiar cookies
        window.location.href = "/admin/login"
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al intentar cerrar sesión",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleLogout} disabled={loading}>
      <LogOut className="mr-2 h-4 w-4" />
      {loading ? "Cerrando sesión..." : "Cerrar sesión"}
    </Button>
  )
}
