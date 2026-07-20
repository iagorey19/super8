import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase"
import { getClientIp, isRateLimited } from "@/lib/rate-limit"
import { validateToken } from "@/lib/auth-secret"

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (await isRateLimited(ip, 10, 60_000)) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente em 1 minuto." }, { status: 429 })
    }

    const auth = req.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "admin_required" }, { status: 401 })
    }
    const authUser = validateToken(auth.slice(7))
    if (!authUser) {
      return NextResponse.json({ error: "admin_required" }, { status: 401 })
    }
    const svc = getServiceClient()
    const requesterRes = await svc.from("users").select("role").eq("id", authUser.userId).single()
    const requester = requesterRes.data as { role: string } | null
    if (!requester || requester.role !== "admin") {
      return NextResponse.json({ error: "admin_required" }, { status: 401 })
    }

    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const { error: createError } = await svc.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      if (createError.message?.includes("already been registered") || createError.message?.includes("already exists")) {
        const { data: { users: authUsers } } = await svc.auth.admin.listUsers()
        const existing = authUsers?.find((u: { email?: string }) => u.email === email)
        if (existing) {
          const { error: updateError } = await svc.auth.admin.updateUserById(existing.id, { password })
          if (updateError) {
            console.error("admin-register updateUserById error:", updateError)
            return NextResponse.json({ error: updateError.message }, { status: 500 })
          }
          return NextResponse.json({ ok: true, note: "updated" })
        }
        return NextResponse.json({ ok: true, note: "already exists" })
      }
      console.error("admin-register createUser error:", createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    console.error("admin-register error:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
