import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    // Crear el bucket si no existe
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const imagesBucket = buckets?.find((bucket) => bucket.name === "images")

    if (!imagesBucket) {
      await supabaseAdmin.storage.createBucket("images", {
        public: true,
      })
    }

    // Generar un nombre de archivo único
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `products/${fileName}`

    // Convertir el archivo a un ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Subir el archivo usando supabaseAdmin
    const { data, error } = await supabaseAdmin.storage.from("images").upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    })

    if (error) {
      console.error("Error uploading file:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Obtener la URL pública
    const { data: urlData } = supabaseAdmin.storage.from("images").getPublicUrl(filePath)

    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch (error) {
    console.error("Error in upload API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
  }
}
