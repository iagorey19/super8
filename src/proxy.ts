import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(_req: NextRequest) {
  const res = NextResponse.next()

  res.headers.set("Cache-Control", "no-store, must-revalidate")
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("X-Frame-Options", "DENY")
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  return res
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
