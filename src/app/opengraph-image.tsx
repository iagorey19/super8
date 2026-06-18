import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const dynamic = "force-dynamic"

export default async function OGImage() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"

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
          backgroundColor: "#fbbf24",
          fontFamily: "system-ui",
        }}
      >
        <img
          src={`${baseUrl}/logo.jpg`}
          width={200}
          height={200}
          style={{ borderRadius: 16 }}
        />
        <p style={{ fontSize: 52, fontWeight: 900, color: "#1c1917", marginTop: 24, marginBottom: 0 }}>
          THE SUPER 8
        </p>
        <p style={{ fontSize: 24, color: "#44403c", marginTop: 12 }}>
          Aplicativo Oficial Do Evento
        </p>
      </div>
    ),
    { ...size },
  )
}
