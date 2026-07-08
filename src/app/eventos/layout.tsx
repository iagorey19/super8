"use client"

import { Navbar } from "@/components/navbar"

export default function EventosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar variant="public" />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </>
  )
}
