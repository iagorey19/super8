import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase"
import crypto from "crypto"
import bcrypt from "bcryptjs"

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000

function signToken(payload: string): string {
  const secret = process.env.AUTH_TOKEN_SECRET || "super8-fallback-secret-do-not-use-in-prod"
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url")
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatórios" }, { status: 400 })
    }

    const svc = getServiceClient()
    const { data: users, error } = await svc.from("users").select("*").eq("email", email)

    if (error) {
      console.error("Session auth error:", error)
      return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }

    const user = users?.[0]
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 })
    }

    const exp = Date.now() + TOKEN_EXPIRY_MS
    const payload = JSON.stringify({ userId: user.id, email: user.email, exp })
    const token = Buffer.from(payload).toString("base64url") + "." + signToken(payload)

    const { password: _, ...safeUser } = user
    return NextResponse.json({ token, user: safeUser })
  } catch (e) {
    console.error("POST /api/auth/session error:", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
