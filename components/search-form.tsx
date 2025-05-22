"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export function SearchForm() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      return
    }

    setIsLoading(true)
    setIsOpen(true)

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
      const data = await response.json()

      setResults(data.products || [])

      if (data.products.length === 0) {
        toast({
          title: "Sin resultados",
          description: "No se encontraron productos que coincidan con tu búsqueda.",
        })
      }
    } catch (error) {
      console.error("Error searching:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al buscar productos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResultClick = (category: string) => {
    // Cerrar resultados
    setIsOpen(false)
    setQuery("")

    // Navegar a la sección del menú y seleccionar la categoría
    const menuElement = document.getElementById("menu")
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: "smooth" })

      // Seleccionar la pestaña correspondiente
      setTimeout(() => {
        const tabButton = document.querySelector(`[data-state="inactive"][value="${category}"]`) as HTMLButtonElement
        if (tabButton) {
          tabButton.click()
        }
      }, 500)
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="search"
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-10"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full"
          disabled={isLoading}
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Buscar</span>
        </Button>
      </form>

      {isOpen && results.length > 0 && (
        <Card className="absolute z-10 mt-1 w-full">
          <CardContent className="p-2">
            <ul className="max-h-60 overflow-auto">
              {results.map((product) => (
                <li key={product.id}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => handleResultClick(product.category)}
                  >
                    <span className="font-medium">{product.name}</span>
                    <span className="ml-2 text-sm text-gray-500">({product.category})</span>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
