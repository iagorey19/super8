import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const entries: { timestamp: string; level: string; message: string; stack?: string; url?: string }[] = body.entries || []

    for (const e of entries) {
      const line = `[${e.timestamp}] [${e.level}] ${e.message}${e.url ? ` (${e.url})` : ""}`
      if (e.level === "ERROR") console.error(line)
      else if (e.level === "WARN") console.warn(line)
      else console.log(line)
      if (e.stack) console.error(e.stack)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Failed to process log:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
