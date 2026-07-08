"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { isSafeRedirect } from "@/lib/validate-url"

export default function AuthHandlerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const next = searchParams.get("next") || "/"
    const safeNext = isSafeRedirect(next) ? next : "/"
    window.location.href = safeNext
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
    </div>
  )
}
