import crypto from "crypto"

export function getAuthSecret(): string {
  const secret = process.env.AUTH_TOKEN_SECRET
  if (!secret) {
    throw new Error("AUTH_TOKEN_SECRET não configurada. Configure no Vercel: https://vercel.com/iagorey19s-projects/super8/settings/environment-variables")
  }
  return secret
}

export function signToken(payloadB64: string): string {
  const secret = getAuthSecret()
  return crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url")
}

export function validateToken(token: string): { userId: string } | null {
  try {
    const [payloadB64, signatureB64] = token.split(".")
    if (!payloadB64 || !signatureB64) return null
    const secret = getAuthSecret()
    const expectedSig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url")
    const sigBuf = Buffer.from(signatureB64, "base64url")
    const expectedBuf = Buffer.from(expectedSig, "base64url")
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString())
    if (payload.exp && payload.exp < Date.now()) return null
    return { userId: payload.userId }
  } catch {
    return null
  }
}
