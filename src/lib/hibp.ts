import crypto from "crypto"

// Checagem de senha vazada via HaveIBeenPwned (API gratuita, k-anonymity:
// só os 5 primeiros chars do SHA-1 saem do servidor, a senha nunca é enviada).
// Retorna true se a senha JÁ vazou (deve ser recusada).
// Fail-open: se a API estiver fora, permite (log) para não travar cadastro.
export async function isPasswordLeaked(password: string): Promise<boolean> {
  try {
    const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase()
    const prefix = sha1.slice(0, 5)
    const suffix = sha1.slice(5)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      signal: controller.signal,
      headers: { "User-Agent": "super8-padel" },
    })
    clearTimeout(timeout)
    if (!res.ok) return false
    const body = await res.text()
    return body.split("\n").some((line) => line.split(":")[0]?.trim() === suffix)
  } catch (e) {
    console.error("hibp check failed (fail-open):", e)
    return false
  }
}
