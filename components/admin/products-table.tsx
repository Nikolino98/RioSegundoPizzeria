"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/lib/supabase-actions"

interface ProductsTableProps {
  initialProducts: Product[]
}

export function ProductsTable({ initialProducts }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    customCategory: "",
  })

  // Cargar categorías existentes
  useEffect(() => {
    const uniqueCategories = Array.from(new Set(products.map((p) => p.category)))
    setCategories(uniqueCategories)
  }, [products])

  // Cargar productos desde Supabase
  const loadProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading products:", error)
        toast.error("Error al cargar productos")
        return
      }

      setProducts(data || [])
    } catch (error) {
      console.error("Error loading products:", error)
      toast.error("Error al cargar productos")
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return null

    setIsUploading(true)
    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `products/${fileName}`

      // Subir imagen a Supabase Storage
      const { error: uploadError, data } = await supabase.storage.from("images").upload(filePath, file)

      if (uploadError) {
        console.error("Error uploading image:", uploadError)
        toast.error("Error al subir la imagen")
        return null
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(filePath)

      toast.success("Imagen subida correctamente")
      return urlData.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Error al subir la imagen")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const imageUrl = await handleImageUpload(file)
    if (imageUrl) {
      setFormData((prev) => ({ ...prev, image: imageUrl }))
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      customCategory: "",
    })
    setEditingProduct(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalCategory = formData.category === "custom" ? formData.customCategory.toLowerCase() : formData.category

    if (!formData.name || !formData.description || !formData.price || !finalCategory) {
      toast.error("Por favor completa todos los campos")
      return
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      image: formData.image || "/placeholder.svg?height=200&width=200",
      category: finalCategory,
    }

    try {
      if (editingProduct) {
        // Actualizar producto existente
        const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id)

        if (error) {
          console.error("Error updating product:", error)
          toast.error("Error al actualizar el producto")
          return
        }

        toast.success("Producto actualizado correctamente")
      } else {
        // Crear nuevo producto
        const { error } = await supabase.from("products").insert([productData])

        if (error) {
          console.error("Error creating product:", error)
          toast.error("Error al crear el producto")
          return
        }

        toast.success("Producto creado correctamente")
      }

      // Recargar productos
      await loadProducts()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error("Error al guardar el producto")
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      customCategory: "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return
    }

    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) {
        console.error("Error deleting product:", error)
        toast.error("Error al eliminar el producto")
        return
      }

      toast.success("Producto eliminado correctamente")
      await loadProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Error al eliminar el producto")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Productos</CardTitle>
            <CardDescription>Gestiona los productos de tu pizzería</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pizzas">Pizzas</SelectItem>
                      <SelectItem value="pastas">Pastas</SelectItem>
                      <SelectItem value="ensaladas">Ensaladas</SelectItem>
                      <SelectItem value="postres">Postres</SelectItem>
                      {categories
                        .filter((cat) => !["pizzas", "pastas", "ensaladas", "postres"].includes(cat))
                        .map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      <SelectItem value="custom">Crear nueva categoría</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.category === "custom" && (
                  <div>
                    <Label htmlFor="customCategory">Nueva Categoría</Label>
                    <Input
                      id="customCategory"
                      value={formData.customCategory}
                      onChange={(e) => setFormData((prev) => ({ ...prev, customCategory: e.target.value }))}
                      placeholder="Nombre de la nueva categoría"
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="image">Imagen</Label>
                  <div className="space-y-2">
                    <Input id="image" type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                    {isUploading && <p className="text-sm text-muted-foreground">Subiendo imagen...</p>}
                    {formData.image && (
                      <div className="relative">
                        <img
                          src={formData.image || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isUploading}>
                    {editingProduct ? "Actualizar" : "Crear"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={product.image || "/placeholder.svg?height=50&width=50"}
                    alt={product.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{product.category}</Badge>
                </TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id!)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
