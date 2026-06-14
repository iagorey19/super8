import type { Metadata, Viewport } from "next"
import { Providers } from "@/components/providers"
import { ErrorLogger } from "@/components/error-logger"
import { DataLoader } from "@/components/data-loader"
import { PWAPrompt } from "@/components/pwa-prompt"
import "./globals.css"

export const metadata: Metadata = {
  title: "THE SUPER 8 - Gestão de Torneios",
  description: "Sistema de gerenciamento de torneios de padel",
  manifest: "/manifest.json",
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
