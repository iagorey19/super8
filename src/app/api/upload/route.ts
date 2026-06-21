import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { name, type } = await req.json()
    if (!name) {
      return NextResponse.json({ error: "Nome do arquivo obrigatório" }, { status: 400 })
    }

    const ext = name.split(".").pop()?.toLowerCase() || "jpg"
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
