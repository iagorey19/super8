export function isSafeRedirect(url: string | null): boolean {
  if (!url) return false
  if (url.startsWith("/")) return true
  try {
    const parsed = new URL(url, "http://localhost")
    if (parsed.protocol === "https:" || parsed.protocol === "http:") return true
    return false
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
