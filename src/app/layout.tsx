import type { Metadata, Viewport } from "next"
import { Providers } from "@/components/providers"
import { ErrorLogger } from "@/components/error-logger"
import { DataLoader } from "@/components/data-loader"
import { PWAPrompt } from "@/components/pwa-prompt"
import "./globals.css"

const siteUrl = "https://super8-three.vercel.app"

export const metadata: Metadata = {
  title: "THE SUPER 8",
  description: "Torneio de padel",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "THE SUPER 8",
    title: "THE SUPER 8",
    description: "Torneio de padel",
    images: [{ url: `${siteUrl}/logo.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "THE SUPER 8",
    description: "Torneio de padel",
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
