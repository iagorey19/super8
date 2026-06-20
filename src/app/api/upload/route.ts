import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const fileName = `${crypto.randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const svc = getServiceClient()
    const { error } = await svc.storage.from("photos").upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      console.error("Upload error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: publicUrl } = svc.storage.from("photos").getPublicUrl(fileName)
    return NextResponse.json({ url: publicUrl.publicUrl })
  } catch (e) {
    console.error("POST /api/upload error:", e)
    return NextResponse.json({ error: "Falha ao fazer upload" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
