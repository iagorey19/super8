import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "THE SUPER 8 — Torneio de Padel"

export default async function OGImage() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"

  const logoSrc = `${baseUrl}/logo.jpg`

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
        <img
          src={logoSrc}
          width={380}
          height={380}
          style={{
            borderRadius: 24,
            objectFit: "contain",
            zIndex: 1,
          }}
        />

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
