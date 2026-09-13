import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase"

// GET /api/data-version — contador global incrementado a cada escrita.
// Resposta de bytes p/ polling barato: o app só baixa /api/data quando muda.
export async function GET() {
  try {
    const svc = getServiceClient()
    const { data } = await svc.from("config").select("data_version").eq("id", "global").maybeSingle() as unknown as { data: { data_version: number } | null }
    const res = NextResponse.json({ v: data?.data_version ?? 0 })
    res.headers.set("Cache-Control", "no-store, must-revalidate")
    return res
  } catch (e) {
    console.error("GET /api/data-version error:", e)
    return NextResponse.json({ v: -1 })
  }
}
