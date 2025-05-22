"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Usar el cliente de Supabase para iniciar sesión
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        toast({
          title: "Error de autenticación",
          description: error.message || "Credenciales incorrectas",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al panel de administración",
      })

      // Esperar un momento para que las cookies se establezcan
      setTimeout(() => {
        // Usar window.location para forzar una recarga completa
        window.location.href = "/admin"
      }, 1000)
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error de inicio de sesión",
        description: "Ocurrió un error al intentar iniciar sesión",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-red-700">Administración Rio Segundo Pizzeria</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={credentials.email} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-red-700 hover:bg-red-800" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
