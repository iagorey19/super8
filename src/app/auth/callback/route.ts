import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getServiceClient } from "@/lib/supabase"
import { getAuthSecret } from "@/lib/auth-secret"
import crypto from "crypto"

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000

function signToken(payload: string): string {
  const secret = getAuthSecret()
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url")
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error("Callback code exchange error:", error)
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
  }

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser?.email) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_email`)
  }

  const svc = getServiceClient()
  const { data: existing } = await svc.from("users").select("*").eq("email", authUser.email) as unknown as { data: any[] | null }

  let appUser = existing?.[0] as Record<string, any> | undefined
  if (!appUser) {
    const newUser = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.full_name || authUser.email.split("@")[0],
      role: "athlete",
      phone: authUser.phone || null,
      avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
      created_at: new Date().toISOString(),
    }
    const { error: insertError } = await (svc.from("users") as any).insert(newUser)
    if (insertError) {
      console.error("Callback user insert error:", insertError)
      return NextResponse.redirect(`${origin}/auth/login?error=create_user_failed`)
    }
    appUser = newUser
  }

  const exp = Date.now() + TOKEN_EXPIRY_MS
  const payload = JSON.stringify({ userId: appUser.id, email: appUser.email, exp })
  const payloadB64 = Buffer.from(payload).toString("base64url")
  const token = payloadB64 + "." + signToken(payloadB64)

  const redirectUrl = new URL(`${origin}/auth/handler`)
  redirectUrl.searchParams.set("next", next)
  const response = NextResponse.redirect(redirectUrl.toString())
  response.cookies.set("super8-auth-token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  })
  return response
}
