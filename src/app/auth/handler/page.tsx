"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AuthHandlerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("auth_token")
    const next = searchParams.get("next") || "/"

    if (token) {
      try {
        const payloadB64 = token.split(".")[0]
        const payload = JSON.parse(atob(payloadB64))
        sessionStorage.setItem("super8-session", JSON.stringify({
          token,
          user: { id: payload.userId, email: payload.email },
        }))
        sessionStorage.setItem("super8-auth-token", token)
      } catch {
        router.replace("/auth/login?error=invalid_token")
        return
      }
    }

    window.location.href = next
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
    </div>
  )
}
