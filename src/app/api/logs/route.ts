import { NextRequest, NextResponse } from "next/server"

const MAX_BODY_SIZE = 10_000
const VALID_LEVELS = new Set(["LOG", "WARN", "ERROR"])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const entries: { timestamp: string; level: string; message: string; stack?: string; url?: string }[] = body.entries || []

    if (!Array.isArray(entries) || entries.length > 50) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    for (const e of entries) {
      if (typeof e.message !== "string" || e.message.length > 1000) continue
      if (!VALID_LEVELS.has(e.level)) continue

      const line = `[${e.timestamp || "?"}] [${e.level}] ${e.message.slice(0, 500)}${e.url ? ` (${e.url})` : ""}`
      if (e.level === "ERROR") console.error(line)
      else if (e.level === "WARN") console.warn(line)
      else console.log(line)
      if (e.stack && typeof e.stack === "string") console.error(e.stack.slice(0, 2000))
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Failed to process log:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
