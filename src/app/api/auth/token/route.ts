import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("super8-auth-token")

  if (!token?.value) {
    return NextResponse.json({ error: "no_token" }, { status: 401 })
  }

  const response = NextResponse.json({ token: token.value })
  response.cookies.set("super8-auth-token", "", { maxAge: 0, path: "/" })
  return response
}
