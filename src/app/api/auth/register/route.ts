import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase"
import { getClientIp, isRateLimited } from "@/lib/rate-limit"
import { getAuthSecret } from "@/lib/auth-secret"
import crypto from "crypto"
import bcrypt from "bcryptjs"

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000

function signToken(payload: string): string {
  const secret = getAuthSecret()
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url")
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (await isRateLimited(ip, 5, 60_000)) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 minuto." }, { status: 429 })
    }

    const { name, email, password, phone } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha obrigatórios" }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Senha deve ter no mínimo 6 caracteres" }, { status: 400 })
    }

    const svc = getServiceClient()

    const { data: existing } = await svc.from("users").select("id").eq("email", email).maybeSingle() as unknown as { data: { id: string } | null }
    if (existing) {
      return NextResponse.json({ error: "Este email já está cadastrado", code: "email_exists" }, { status: 409 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const { error: authError } = await svc.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authError && !authError.message?.includes("already been registered")) {
      console.error("POST /api/auth/register auth create error:", authError)
      return NextResponse.json({ error: "Erro ao criar autenticação" }, { status: 500 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { error: insertError } = await (svc.from("users") as unknown as { insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }> }).insert({
      id,
      email,
      password: hashedPassword,
      name,
      role: "athlete",
      phone: phone || null,
      created_at: now,
    })

    if (insertError) {
      console.error("POST /api/auth/register insert error:", insertError)
      return NextResponse.json({ error: "Erro ao criar cadastro" }, { status: 500 })
    }

    const exp = Date.now() + TOKEN_EXPIRY_MS
    const payload = JSON.stringify({ userId: id, exp })
    const payloadB64 = Buffer.from(payload).toString("base64url")
    const token = payloadB64 + "." + signToken(payloadB64)

    const response = NextResponse.json({
      token,
      user: { id, email, name, role: "athlete", phone: phone || null, created_at: now },
    })
    response.cookies.set("super8-auth-token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    })
    return response
  } catch (e) {
    console.error("POST /api/auth/register error:", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
