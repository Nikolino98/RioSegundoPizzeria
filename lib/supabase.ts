import { createClient } from "@supabase/supabase-js"

// Crear un cliente de Supabase con las credenciales públicas
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "supabase.auth.token",
    },
  },
)
