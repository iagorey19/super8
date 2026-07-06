const logs = new Map<string, { count: number; resetAt: number }>()

export function getClientIp(req: Request): string {
  return req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "unknown"
}

export function isRateLimited(ip: string, max: number = 30, windowMs: number = 60_000): boolean {
  const now = Date.now()
  const entry = logs.get(ip)
  if (!entry || now > entry.resetAt) {
    logs.set(ip, { count: 1, resetAt: now + windowMs })
    return false
  }
  entry.count++
  return entry.count > max
}
