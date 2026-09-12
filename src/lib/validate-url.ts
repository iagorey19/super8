export function isSafeRedirect(url: string | null): boolean {
  if (!url) return false
  // Só destinos internos: path relativo sem host. Bloqueia "//evil.com" e URLs absolutas.
  if (!url.startsWith("/") || url.startsWith("//")) return false
  try {
    const parsed = new URL(url, "http://localhost")
    // Com base http://localhost, qualquer host diferente indica tentativa de fuga.
    if (parsed.host !== "localhost") return false
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false
    return true
  } catch {
    return false
  }
}

export function isSafeUrl(url: string): boolean {
  if (!url) return false
  const protocol = url.split(":")[0]?.toLowerCase()
  if (protocol === "javascript" || protocol === "data" || protocol === "vbscript") return false
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/") || url.startsWith("#")
}

export function sanitizeUrl(url: string, fallback: string = "#"): string {
  return isSafeUrl(url) ? url : fallback
}
