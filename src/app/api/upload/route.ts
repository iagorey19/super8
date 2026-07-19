import { NextResponse } from "next/server"
import crypto from "crypto"
import { cookies } from "next/headers"
import { getServiceClient } from "@/lib/supabase"
import { getClientIp, isRateLimited } from "@/lib/rate-limit"
import { validateToken } from "@/lib/auth-secret"

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "mp4"])
const MAX_FILE_SIZE = 10 * 1024 * 1024

async function validateSession(req: Request): Promise<boolean> {
  const auth = req.headers.get("authorization")
  if (auth?.startsWith("Bearer ")) {
    const result = validateToken(auth.slice(7))
    if (result) return true
  }
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get("super8-auth-token")
  if (tokenCookie?.value) {
    const result = validateToken(tokenCookie.value)
    if (result) return true
  }
  return false
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (await isRateLimited(ip, 30, 60_000)) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente mais tarde." }, { status: 429 })
    }

    if (!await validateSession(req)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { name, type } = await req.json()
    if (!name) {
      return NextResponse.json({ error: "Nome do arquivo obrigatório" }, { status: 400 })
    }

    const ext = name.split(".").pop()?.toLowerCase() || ""
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido. Use JPG, PNG, GIF, WEBP ou MP4." }, { status: 400 })
    }

    const contentLength = req.headers.get("content-length")
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo: 10MB." }, { status: 413 })
    }

    const fileName = `${crypto.randomUUID()}.${ext}`

    const svc = getServiceClient()
    const { data, error } = await svc.storage.from("photos").createSignedUploadUrl(fileName, {
      upsert: false,
    })

    if (error) {
      console.error("Signed URL error:", error)
      console.error("upload error:", error.message)
      return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 })
    }

    const { data: publicUrl } = svc.storage.from("photos").getPublicUrl(fileName)

    return NextResponse.json({
      signedUrl: data.signedUrl,
      publicUrl: publicUrl.publicUrl,
      fileName,
    })
  } catch (e) {
    console.error("POST /api/upload error:", e)
    return NextResponse.json({ error: "Falha ao gerar URL de upload" }, { status: 500 })
  }
}
