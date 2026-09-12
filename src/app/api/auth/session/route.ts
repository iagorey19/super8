import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getServiceClient } from "@/lib/supabase"
import { getClientIp, isRateLimited } from "@/lib/rate-limit"
import { validateToken, signToken } from "@/lib/auth-secret"
import { stripPassword } from "@/lib/utils"
import bcrypt from "bcryptjs"

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (await isRateLimited(ip, 5, 60_000)) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 minuto." }, { status: 429 })
    }

    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatórios" }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
    }

    const svc = getServiceClient()
    const { data: users, error } = await svc.from("users").select("*").eq("email", email) as unknown as { data: { id: string; email: string; password: string; name: string; role: string; phone?: string; avatar?: string; created_at: string }[] | null; error: { message: string } | null }

    if (error) {
      console.error("Session auth error:", error)
      return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }

    const user = users?.[0] as { id: string; email: string; password: string; name: string; role: string } | undefined
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 })
    }

    const exp = Date.now() + TOKEN_EXPIRY_MS
    const payload = JSON.stringify({ userId: user.id, exp })
    const payloadB64 = Buffer.from(payload).toString("base64url")
    const token = payloadB64 + "." + signToken(payloadB64)

    const safeUser = stripPassword(user as unknown as Record<string, unknown>)
    const response = NextResponse.json({ token, user: safeUser })
    const secure = process.env.NODE_ENV === "production"
    response.cookies.set("super8-auth-token", token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    })
    return response
  } catch (e) {
    console.error("POST /api/auth/session error:", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get("super8-auth-token")
    if (!tokenCookie?.value) {
      return NextResponse.json({ error: "no_session" }, { status: 401 })
    }

    const result = validateToken(tokenCookie.value)
    if (!result) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 })
    }

    const svc = getServiceClient()
    const { data: users } = await svc.from("users").select("*").eq("id", result.userId) as unknown as { data: { id: string; email: string; name: string; role: string; phone?: string; avatar?: string; created_at: string }[] | null }
    const user = users?.[0] as Record<string, unknown> | undefined
    if (!user) {
      return NextResponse.json({ error: "user_not_found" }, { status: 401 })
    }

    const safeUser = stripPassword(user as unknown as Record<string, unknown>)
    return NextResponse.json({ user: safeUser, token: tokenCookie.value })
  } catch (e) {
    console.error("GET /api/auth/session error:", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const ip = getClientIp(req)
  if (await isRateLimited(ip, 30, 60_000)) {
    return NextResponse.json({ error: "Muitas requisições. Tente novamente mais tarde." }, { status: 429 })
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set("super8-auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
  return response
}
