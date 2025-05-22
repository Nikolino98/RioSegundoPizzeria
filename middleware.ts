import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Permitir todas las solicitudes
  return NextResponse.next()
}

// Configurar el middleware para que solo se ejecute en las rutas de admin
export const config = {
  matcher: ["/admin/:path*"],
}
