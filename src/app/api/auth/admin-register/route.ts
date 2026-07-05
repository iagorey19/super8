import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 })
    }

    const svc = getServiceClient()
    const { error } = await svc.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) {
      if (error.message?.includes("already been registered") || error.message?.includes("already exists")) {
        return NextResponse.json({ ok: true, note: "already exists" })
      }
      console.error("admin-register createUser error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("admin-register error:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
