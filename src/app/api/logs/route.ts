import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getClientIp, isRateLimited } from "@/lib/rate-limit"
import { validateToken } from "@/lib/auth-secret"
import { serverLogger } from "@/lib/server-logger"

const VALID_LEVELS = new Set(["LOG", "WARN", "ERROR", "INFO"])

function clean(value: unknown, max: number): string {
  return String(value ?? "").replace(/[\r\n]+/g, " ").slice(0, max)
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    if (await isRateLimited(ip, 60, 60_000)) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente mais tarde." }, { status: 429 })
    }
    const contentLength = req.headers.get("content-length")
    if (contentLength && parseInt(contentLength) > 32_768) {
      return NextResponse.json({ error: "Payload muito grande" }, { status: 413 })
    }

    // Endpoint de escrita: exige sessão válida (qualquer papel)
    const auth = req.headers.get("authorization")
    let authed = false
    if (auth?.startsWith("Bearer ") && validateToken(auth.slice(7))) {
      authed = true
    }
    if (!authed) {
      const cookieStore = await cookies()
      const tokenCookie = cookieStore.get("super8-auth-token")
      if (tokenCookie?.value && validateToken(tokenCookie.value)) authed = true
    }
    if (!authed) {
      return NextResponse.json({ error: "auth_required" }, { status: 401 })
    }

    const body = await req.json()
    const entries: { timestamp: string; level: string; message: string; stack?: string; url?: string }[] = body.entries || []

    if (!Array.isArray(entries) || entries.length > 50) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    for (const e of entries) {
      if (typeof e.message !== "string" || e.message.length > 1000) continue
      if (!VALID_LEVELS.has(e.level)) continue

      const message = clean(e.message, 500)
      const url = typeof e.url === "string" ? clean(e.url, 500) : ""
      const line = `[${clean(e.timestamp, 40) || "?"}] [${e.level}] ${message}${url ? ` (${url})` : ""}`
      if (e.level === "ERROR") serverLogger.error({ url }, line)
      else if (e.level === "WARN") serverLogger.warn(line)
      else serverLogger.info(line)
      if (e.stack && typeof e.stack === "string") serverLogger.error(clean(e.stack, 2000))
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Failed to process log:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
