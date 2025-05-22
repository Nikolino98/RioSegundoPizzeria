import { createClient } from "@supabase/supabase-js"

// Crear un cliente de Supabase con la clave de servicio para operaciones administrativas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export { supabaseAdmin }
