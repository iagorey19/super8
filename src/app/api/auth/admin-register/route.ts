import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase"
import { isRateLimited } from "@/lib/rate-limit"

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    if (isRateLimited(ip, 10, 60_000)) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente em 1 minuto." }, { status: 429 })
    }

    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 })
    }

    const svc = getServiceClient()
    const { error: createError } = await svc.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      if (createError.message?.includes("already been registered") || createError.message?.includes("already exists")) {
        const { data: { users: authUsers } } = await svc.auth.admin.listUsers()
        const existing = authUsers?.find((u: any) => u.email === email)
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
  } catch (e: any) {
    console.error("admin-register error:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
