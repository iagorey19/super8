import { ImageResponse } from "next/og"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "THE SUPER 8 — Torneio de Padel"

export default async function OGImage() {
  // Read logo directly from filesystem (reliable in Vercel serverless)
  let logoBase64 = ""
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.jpg")
    const logoBuffer = fs.readFileSync(logoPath)
    logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString("base64")}`
  } catch (err: unknown) {
    console.error("[OG-IMAGE] Erro ao ler a logo:", err)
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a1628 0%, #162240 50%, #1a2744 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative radial glow behind logo */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(217, 119, 6, 0.15) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
          }}
        />

        {/* Logo — large and centered */}
        {logoBase64 ? (
          <img
            src={logoBase64}
            width={380}
            height={380}
            style={{
              borderRadius: 24,
              objectFit: "contain",
              zIndex: 1,
              border: "2px solid rgba(245, 158, 11, 0.3)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
            }}
          />
        ) : (
          <div
            style={{
              width: 380,
              height: 380,
              borderRadius: 24,
              background: "#1a2744",
              border: "2px solid rgba(245, 158, 11, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              fontWeight: 900,
              color: "#ffffff",
              zIndex: 1,
            }}
          >
            S8
          </div>
        )}

        {/* Subtitle */}
        <p
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.7)",
            marginTop: 20,
            marginBottom: 0,
            letterSpacing: 4,
            textTransform: "uppercase",
            zIndex: 1,
          }}
        >
          Torneio de Padel
        </p>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, transparent 0%, #d97706 50%, transparent 100%)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  )
}
