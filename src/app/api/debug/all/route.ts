import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getServiceClient } from "@/lib/supabase"
import { validateToken } from "@/lib/auth-secret"

// GET /api/debug/all — diagnostico para a IA (poll a cada 30s).
// Expõe SOMENTE nomes/booleans. NUNCA valores de secrets.
// Em produção exige token de admin (evita fingerprinting).
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    const auth = req.headers.get("authorization")
    let userId: string | null = null
    if (auth?.startsWith("Bearer ")) {
      userId = validateToken(auth.slice(7))?.userId ?? null
    }
    if (!userId) {
      const cookieStore = await cookies()
      const tokenCookie = cookieStore.get("super8-auth-token")
      if (tokenCookie?.value) {
        userId = validateToken(tokenCookie.value)?.userId ?? null
      }
    }
    if (!userId) {
      return NextResponse.json({ error: "admin_required" }, { status: 401 })
    }
    const svc = getServiceClient()
    const { data } = await svc.from("users").select("role").eq("id", userId).maybeSingle() as unknown as { data: { role: string } | null }
    if (data?.role !== "admin") {
      return NextResponse.json({ error: "admin_required" }, { status: 401 })
    }
  }
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasAuthSecret: Boolean(process.env.AUTH_TOKEN_SECRET),
      hasExecSqlSecret: Boolean(process.env.EXEC_SQL_SECRET),
      hasGoogleOAuth:
        Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET),
    },
    runtime: {
      node: process.version,
      nodeEnv: process.env.NODE_ENV,
    },
    supabaseProject: "ylltshboiejlcbhksrci",
  })
}
