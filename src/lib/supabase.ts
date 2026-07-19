import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const missing: string[] = []
if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL")
if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
if (missing.length > 0) {
  throw new Error(`Variáveis de ambiente faltando: ${missing.join(", ")}`)
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

let _serviceClient: ReturnType<typeof createClient> | null = null

export function getServiceClient() {
  if (_serviceClient) return _serviceClient
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada")
  _serviceClient = createClient(supabaseUrl!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return _serviceClient
}
