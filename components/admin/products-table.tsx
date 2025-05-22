"use client"

import type React from "react"
import { Loader2 } from "lucide-react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Edit, Plus, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

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

interface ProductsTableProps {
  products: Product[]
  onUpdate: (product: Product) => void
  onCreate: (product: Product) => void
  onDelete: (productId: string) => void
}

export function ProductsTable({ products, onUpdate, onCreate, onDelete }: ProductsTableProps) {
  const { toast } = useToast()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [customCategory, setCustomCategory] = useState("")
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Obtener categorías únicas de los productos
  const categories = Array.from(new Set(products.map((product) => product.category)))

  const handleEdit = (product: Product) => {
    setCurrentProduct(product)
    setIsEditDialogOpen(true)
    setShowCustomCategory(false)
  }

  const handleDelete = (product: Product) => {
    setCurrentProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const handleCreateNew = () => {
    setCurrentProduct({
      id: "",
      name: "",
      description: "",
      price: 0,
      image: "",
      category: "pizzas",
    })
    setIsCreateDialogOpen(true)
    setShowCustomCategory(false)
    setCustomCategory("")
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Si se está usando una categoría personalizada, asignarla al producto
      if (showCustomCategory && customCategory.trim()) {
        setCurrentProduct((prev: any) => ({ ...prev, category: customCategory.trim().toLowerCase() }))
      }

      const finalCategory =
        showCustomCategory && customCategory.trim() ? customCategory.trim().toLowerCase() : currentProduct.category

      const { error } = await supabase
        .from("products")
        .update({
          name: currentProduct.name,
          description: currentProduct.description,
          price: currentProduct.price,
          image: currentProduct.image,
          category: finalCategory,
        })
        .eq("id", currentProduct.id)

      if (error) {
        throw error
      }

      onUpdate({ ...currentProduct, category: finalCategory })
      setIsEditDialogOpen(false)

      toast({
        title: "Producto actualizado",
        description: "El producto se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Si se está usando una categoría personalizada, asignarla al producto
      const finalCategory =
        showCustomCategory && customCategory.trim() ? customCategory.trim().toLowerCase() : currentProduct.category

      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            name: currentProduct.name,
            description: currentProduct.description,
            price: currentProduct.price,
            image: currentProduct.image || "/placeholder.svg?height=96&width=96",
            category: finalCategory,
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      const newProduct = { ...currentProduct, id: data.id, category: finalCategory }
      onCreate(newProduct)
      setIsCreateDialogOpen(false)

      toast({
        title: "Producto creado",
        description: "El producto se ha creado correctamente",
      })
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el producto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    setLoading(true)

    try {
      // Primero, intentamos eliminar la imagen asociada si existe
      if (currentProduct.image && currentProduct.image.includes("storage.googleapis.com")) {
        // Extraer el path de la imagen desde la URL
        const imagePath = currentProduct.image.split("/").slice(-2).join("/")

        if (imagePath) {
          await supabase.storage.from("images").remove([imagePath])
        }
      }

      const { error } = await supabase.from("products").delete().eq("id", currentProduct.id)

      if (error) {
        throw error
      }

      onDelete(currentProduct.id)
      setIsDeleteDialogOpen(false)

      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentProduct((prev: any) => ({ ...prev, [name]: name === "price" ? Number.parseFloat(value) : value }))
  }

  const handleSelectChange = (value: string) => {
    if (value === "custom") {
      setShowCustomCategory(true)
    } else {
      setShowCustomCategory(false)
      setCurrentProduct((prev: any) => ({ ...prev, category: value }))
    }
  }

  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCategory(e.target.value)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)

    try {
      // Usar una URL de imagen de placeholder si no se puede subir la imagen
      const placeholderUrl = `/placeholder.svg?height=96&width=96&text=${encodeURIComponent(
        currentProduct.name || "Producto",
      )}`

      // Crear un FormData para enviar el archivo
      const formData = new FormData()
      formData.append("file", file)

      // Enviar el archivo a nuestra API de carga
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al subir la imagen")
      }

      // Actualizar el producto con la URL de la imagen
      setCurrentProduct((prev: any) => ({ ...prev, image: result.url }))

      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente",
      })
    } catch (error) {
      console.error("Error uploading image:", error)

      // Si falla la subida, usar la imagen de placeholder
      const placeholderUrl = `/placeholder.svg?height=96&width=96&text=${encodeURIComponent(
        currentProduct.name || "Producto",
      )}`
      setCurrentProduct((prev: any) => ({ ...prev, image: placeholderUrl }))

      toast({
        title: "Aviso",
        description: "No se pudo subir la imagen. Se usará una imagen de placeholder.",
        variant: "default",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h2 className="text-xl font-bold">Gestión de Productos</h2>
        <Button onClick={handleCreateNew} className="bg-red-700 hover:bg-red-800">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="h-10 w-10 overflow-hidden rounded-md">
                    <Image
                      src={product.image || "/placeholder.svg?height=40&width=40"}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-700 hover:text-red-800"
                      onClick={() => handleDelete(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Hidden file input for image upload */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" value={currentProduct?.name || ""} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={currentProduct?.description || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={currentProduct?.price || 0}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Imagen</Label>
              <div className="flex items-center space-x-4">
                {currentProduct?.image && (
                  <div className="h-16 w-16 overflow-hidden rounded-md">
                    <Image
                      src={currentProduct.image || "/placeholder.svg"}
                      alt="Vista previa"
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex-1"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" /> Subir Imagen
                    </>
                  )}
                </Button>
              </div>
              <Input
                id="image"
                name="image"
                value={currentProduct?.image || ""}
                onChange={handleInputChange}
                placeholder="O ingresa la URL de la imagen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={showCustomCategory ? "custom" : currentProduct?.category || "pizzas"}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {/* Categorías predefinidas */}
                  <SelectItem value="pizzas">Pizzas</SelectItem>
                  <SelectItem value="pastas">Pastas</SelectItem>
                  <SelectItem value="ensaladas">Ensaladas</SelectItem>
                  <SelectItem value="postres">Postres</SelectItem>

                  {/* Categorías existentes que no son las predefinidas */}
                  {categories
                    .filter((cat) => !["pizzas", "pastas", "ensaladas", "postres"].includes(cat))
                    .map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}

                  {/* Opción para categoría personalizada */}
                  <SelectItem value="custom">Crear nueva categoría</SelectItem>
                </SelectContent>
              </Select>

              {/* Campo para categoría personalizada */}
              {showCustomCategory && (
                <div className="mt-2">
                  <Input
                    placeholder="Ingresa el nombre de la nueva categoría"
                    value={customCategory}
                    onChange={handleCustomCategoryChange}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-red-700 hover:bg-red-800" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Producto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nombre</Label>
              <Input
                id="create-name"
                name="name"
                value={currentProduct?.name || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Descripción</Label>
              <Textarea
                id="create-description"
                name="description"
                value={currentProduct?.description || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-price">Precio</Label>
              <Input
                id="create-price"
                name="price"
                type="number"
                step="0.01"
                value={currentProduct?.price || 0}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Imagen</Label>
              <div className="flex items-center space-x-4">
                {currentProduct?.image && (
                  <div className="h-16 w-16 overflow-hidden rounded-md">
                    <Image
                      src={currentProduct.image || "/placeholder.svg"}
                      alt="Vista previa"
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex-1"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" /> Subir Imagen
                    </>
                  )}
                </Button>
              </div>
              <Input
                id="create-image"
                name="image"
                value={currentProduct?.image || ""}
                onChange={handleInputChange}
                placeholder="O ingresa la URL de la imagen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-category">Categoría</Label>
              <Select
                value={showCustomCategory ? "custom" : currentProduct?.category || "pizzas"}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {/* Categorías predefinidas */}
                  <SelectItem value="pizzas">Pizzas</SelectItem>
                  <SelectItem value="pastas">Pastas</SelectItem>
                  <SelectItem value="ensaladas">Ensaladas</SelectItem>
                  <SelectItem value="postres">Postres</SelectItem>

                  {/* Categorías existentes que no son las predefinidas */}
                  {categories
                    .filter((cat) => !["pizzas", "pastas", "ensaladas", "postres"].includes(cat))
                    .map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}

                  {/* Opción para categoría personalizada */}
                  <SelectItem value="custom">Crear nueva categoría</SelectItem>
                </SelectContent>
              </Select>

              {/* Campo para categoría personalizada */}
              {showCustomCategory && (
                <div className="mt-2">
                  <Input
                    placeholder="Ingresa el nombre de la nueva categoría"
                    value={customCategory}
                    onChange={handleCustomCategoryChange}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-red-700 hover:bg-red-800" disabled={loading}>
                {loading ? "Creando..." : "Crear Producto"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              ¿Estás seguro de que deseas eliminar el producto <strong>{currentProduct?.name}</strong>? Esta acción no
              se puede deshacer.
            </p>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" variant="destructive" onClick={handleConfirmDelete} disabled={loading}>
                {loading ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
