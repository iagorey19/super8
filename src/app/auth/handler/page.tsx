"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { isSafeRedirect } from "@/lib/validate-url"

export default function AuthHandlerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const next = searchParams.get("next") || "/"

    fetch("/api/auth/token")
      .then((res) => {
        if (!res.ok) throw new Error("no_token")
        return res.json()
      })
      .then((data) => {
        const payloadB64 = data.token.split(".")[0]
        const payload = JSON.parse(atob(payloadB64))
        sessionStorage.setItem("super8-session", JSON.stringify({
          token: data.token,
          user: { id: payload.userId, email: payload.email },
        }))
        sessionStorage.setItem("super8-auth-token", data.token)
        const safeNext = isSafeRedirect(next) ? next : "/"
        window.location.href = safeNext
      })
      .catch(() => {
        router.replace("/auth/login?error=invalid_token")
      })
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
    </div>
  )
}
