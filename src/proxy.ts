import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(_req: NextRequest) {
  const res = NextResponse.next()
  res.headers.set("Cache-Control", "no-store, must-revalidate")
  return res
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
