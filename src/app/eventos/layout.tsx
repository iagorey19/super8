"use client"

import { PublicNavbar } from "@/components/public-navbar"

export default function EventosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </>
  )
}
