import crypto from "crypto"

export function getAuthSecret(): string {
  const secret = process.env.AUTH_TOKEN_SECRET
  if (!secret) {
    throw new Error("AUTH_TOKEN_SECRET não configurada. Configure no Vercel: https://vercel.com/iagorey19s-projects/super8/settings/environment-variables")
  }
  return secret
}

export function validateToken(token: string): { userId: string } | null {
  try {
    const [payloadB64, signatureB64] = token.split(".")
    if (!payloadB64 || !signatureB64) return null
    const secret = getAuthSecret()
    const expectedSig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url")
    if (signatureB64 !== expectedSig) return null
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString())
    if (payload.exp && payload.exp < Date.now()) return null
    return { userId: payload.userId }
  } catch {
    return null
  }
}
