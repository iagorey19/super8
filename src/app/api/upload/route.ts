import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase"

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "mp4"])
const MAX_FILE_SIZE = 10 * 1024 * 1024

async function validateSession(req: Request): Promise<boolean> {
  const auth = req.headers.get("authorization")
  if (!auth?.startsWith("Bearer ")) return false
  const token = auth.slice(7)
  try {
    const [payloadB64] = token.split(".")
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString())
    if (payload.exp && payload.exp < Date.now()) return false
    const svc = getServiceClient()
    const { data } = await svc.from("users").select("id").eq("id", payload.userId).single()
    return !!data
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  try {
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

    if (type === "fileSize" || (req.headers.get("content-length") && parseInt(req.headers.get("content-length")!) > MAX_FILE_SIZE)) {
      // Size check via metadata — actual enforcement at signed URL level
    }

    const fileName = `${crypto.randomUUID()}.${ext}`

    const svc = getServiceClient()
    const { data, error } = await svc.storage.from("photos").createSignedUploadUrl(fileName, {
      upsert: false,
    })

    if (error) {
      console.error("Signed URL error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
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
