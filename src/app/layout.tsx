import type { Metadata, Viewport } from "next"
import { Providers } from "@/components/providers"
import { ErrorLogger } from "@/components/error-logger"
import { DataLoader } from "@/components/data-loader"
import { PWAPrompt } from "@/components/pwa-prompt"
import "./globals.css"

const siteUrl = "https://super8-three.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "THE SUPER 8",
  description: "Aplicativo Oficial Do Evento",
  manifest: "/manifest.json",
  icons: { apple: "/logo.jpg" },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "THE SUPER 8",
    title: "THE SUPER 8",
    description: "Aplicativo Oficial Do Evento",
    images: [
      {
        url: `${siteUrl}/logo.jpg`,
        alt: "THE SUPER 8",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "THE SUPER 8",
    description: "Aplicativo Oficial Do Evento",
    images: [`${siteUrl}/logo.jpg`],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#d97706",
}



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full antialiased bg-gray-50 dark:bg-gray-950">
        <ErrorLogger />
        <DataLoader>
          <Providers>{children}</Providers>
        </DataLoader>
        <PWAPrompt />
      </body>
    </html>
  )
}
