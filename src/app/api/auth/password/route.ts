import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { getServiceClient } from "@/lib/supabase"
import { getClientIp, isRateLimited } from "@/lib/rate-limit"
import { validateToken } from "@/lib/auth-secret"
import { isPasswordLeaked } from "@/lib/hibp"

function passwordError(pw: string): string | null {
  if (pw.length < 6) return "A senha deve ter no mínimo 6 caracteres"
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) {
    return "Senha deve conter ao menos uma letra maiúscula, uma minúscula e um número"
  }
  return null
}

function getAppUserId(req: Request, cookieToken?: string): string | null {
  const auth = req.headers.get("authorization")
  if (auth?.startsWith("Bearer ")) {
    const result = validateToken(auth.slice(7))
    if (result) return result.userId
  }
  if (cookieToken) {
    const result = validateToken(cookieToken)
    if (result) return result.userId
  }
  return null
}

async function syncAuthPassword(email: string, newPassword: string) {
  try {
    const svc = getServiceClient()
    const { data } = await svc.auth.admin.listUsers()
    const existing = data?.users?.find((u) => u.email === email)
    if (existing) {
      await svc.auth.admin.updateUserById(existing.id, { password: newPassword })
    }
  } catch (e) {
    console.error("password sync-auth error:", e)
  }
}

// POST — troca autenticada: exige senha atual (confere no servidor).
export async function POST(req: Request) {
  const ip = getClientIp(req)
  if (await isRateLimited(ip, 5, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 minuto." }, { status: 429 })
  }
  const cookieStore = await cookies()
  const userId = getAppUserId(req, cookieStore.get("super8-auth-token")?.value)
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 })
  }
  const { currentPassword, newPassword } = await req.json()
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Senha atual e nova senha são obrigatórias" }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "A nova senha deve ter no mínimo 6 caracteres" }, { status: 400 })
  }
  const policyError = passwordError(newPassword)
  if (policyError) {
    return NextResponse.json({ error: policyError }, { status: 400 })
  }
  if (await isPasswordLeaked(newPassword)) {
    return NextResponse.json({ error: "Essa senha já vazou em outros sites. Escolha outra senha." }, { status: 400 })
  }
  const svc = getServiceClient()
  const { data: row } = await svc.from("users").select("id,email,password").eq("id", userId).maybeSingle() as unknown as { data: { id: string; email: string; password: string } | null }
  if (!row) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  }
  const ok = await bcrypt.compare(currentPassword, row.password)
  if (!ok) {
    return NextResponse.json({ error: "Senha atual incorreta" }, { status: 403 })
  }
  const hashed = await bcrypt.hash(newPassword, 10)
  const { error: updateError } = await (svc.from("users") as unknown as { update: (r: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> } }).update({ password: hashed }).eq("id", userId)
  if (updateError) {
    console.error("password update error:", updateError)
    return NextResponse.json({ error: "Erro ao atualizar senha" }, { status: 500 })
  }
  await syncAuthPassword(row.email, newPassword)
  return NextResponse.json({ ok: true })
}

// PUT — sincroniza public.users após reset via OTP do Supabase Auth.
// Prova: access_token válido de sessão Auth (só obtido via OTP/senha).
export async function PUT(req: Request) {
  const ip = getClientIp(req)
  if (await isRateLimited(ip, 5, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 minuto." }, { status: 429 })
  }
  const { access_token, password } = await req.json()
  if (!access_token || !password) {
    return NextResponse.json({ error: "Token e nova senha são obrigatórios" }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "A senha deve ter no mínimo 6 caracteres" }, { status: 400 })
  }
  const policyError = passwordError(password)
  if (policyError) {
    return NextResponse.json({ error: policyError }, { status: 400 })
  }
  if (await isPasswordLeaked(password)) {
    return NextResponse.json({ error: "Essa senha já vazou em outros sites. Escolha outra senha." }, { status: 400 })
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${access_token}` } },
  })
  const { data: { user: authUser }, error: userError } = await client.auth.getUser()
  if (userError || !authUser?.email) {
    return NextResponse.json({ error: "Sessão de redefinição inválida" }, { status: 401 })
  }
  const svc = getServiceClient()
  const hashed = await bcrypt.hash(password, 10)
  const { error: updateError } = await (svc.from("users") as unknown as { update: (r: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: unknown }> } }).update({ password: hashed }).eq("email", authUser.email)
  if (updateError) {
    console.error("password reset-sync error:", updateError)
    return NextResponse.json({ error: "Erro ao sincronizar senha" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
