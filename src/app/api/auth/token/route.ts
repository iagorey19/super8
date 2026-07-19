import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getClientIp, isRateLimited } from "@/lib/rate-limit"

export async function GET(req: Request) {
  const ip = getClientIp(req)
  if (await isRateLimited(ip, 30, 60_000)) {
    return NextResponse.json({ error: "Muitas requisições. Tente novamente mais tarde." }, { status: 429 })
  }

  const cookieStore = await cookies()
  const token = cookieStore.get("super8-auth-token")

  if (!token?.value) {
    return NextResponse.json({ error: "no_token" }, { status: 401 })
  }

  const response = NextResponse.json({ token: token.value })
  return response
}
