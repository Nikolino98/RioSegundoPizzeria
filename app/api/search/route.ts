import { type NextRequest, NextResponse } from "next/server"
import { getProducts } from "@/lib/supabase-actions"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json({ products: [] })
    }

    // Obtener todos los productos
    const allProducts = await getProducts()

    // Filtrar productos que coincidan con la búsqueda
    const filteredProducts = allProducts.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(query.toLowerCase())
      const descriptionMatch = product.description.toLowerCase().includes(query.toLowerCase())
      return nameMatch || descriptionMatch
    })

    return NextResponse.json({ products: filteredProducts })
  } catch (error) {
    console.error("Error searching products:", error)
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 })
  }
}
