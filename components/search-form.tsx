"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/lib/supabase-actions"

export function SearchForm() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])

  // Cargar todos los productos al montar el componente
  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase.from("products").select("*")
        if (error) {
          console.error("Error loading products:", error)
          return
        }
        setAllProducts(data || [])
      } catch (error) {
        console.error("Error loading products:", error)
      }
    }

    loadProducts()
  }, [])

  // Filtrar productos cuando cambie la consulta
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    const filteredProducts = allProducts.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(query.toLowerCase())
      const descriptionMatch = product.description.toLowerCase().includes(query.toLowerCase())
      const categoryMatch = product.category.toLowerCase().includes(query.toLowerCase())
      return nameMatch || descriptionMatch || categoryMatch
    })

    setResults(filteredProducts)
    setIsLoading(false)
  }, [query, allProducts])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // La búsqueda se realiza automáticamente en el useEffect
  }

  const scrollToCategory = (category: string) => {
    const element = document.getElementById(`category-${category}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setQuery("")
      setResults([])
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4"
        />
      </form>

      {/* Resultados de búsqueda */}
      {query && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto">
          <Card>
            <CardContent className="p-2">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Buscando...</div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => scrollToCategory(product.category)}
                    >
                      <img
                        src={product.image || "/placeholder.svg?height=40&width=40"}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
                      </div>
                      <p className="text-sm font-medium">${product.price}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">No se encontraron productos</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
