let warned = false

export function getAuthSecret(): string {
  const secret = process.env.AUTH_TOKEN_SECRET
  if (!secret && !warned) {
    warned = true
    console.warn("⚠️ AUTH_TOKEN_SECRET não configurada. Usando fallback inseguro. Configure no Vercel: https://vercel.com/iagorey19s-projects/super8/settings/environment-variables")
  }
  return secret || "super8-fallback-secret-do-not-use-in-prod"
}
