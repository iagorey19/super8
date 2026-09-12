import { NextResponse } from "next/server"

// GET /api/debug/all — diagnostico para a IA (poll a cada 30s).
// Expõe SOMENTE nomes/booleans. NUNCA valores de secrets.
export async function GET() {
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
