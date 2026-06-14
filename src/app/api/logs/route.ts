import { NextRequest, NextResponse } from "next/server"
import { appendFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function POST(req: NextRequest) {
  const logsDir = path.join(process.cwd(), "logs")

  if (!existsSync(logsDir)) {
    await mkdir(logsDir, { recursive: true })
  }

  const date = new Date().toISOString().slice(0, 10)
  const filePath = path.join(logsDir, `super8-${date}.log`)

  try {
    const body = await req.json()
    const entries: { timestamp: string; level: string; message: string; stack?: string; url?: string }[] = body.entries || []

    const lines = entries.map((e) => {
      let line = `[${e.timestamp}] [${e.level}] ${e.message}`
      if (e.url) line += ` (${e.url})`
      if (e.stack) line += `\n${e.stack}`
      return line
    })

    await appendFile(filePath, lines.join("\n") + "\n", "utf-8")

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Failed to write log:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
