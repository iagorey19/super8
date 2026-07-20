import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

let _svc: ReturnType<typeof createClient> | null = null

function getSvc() {
  if (_svc) return _svc
  _svc = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return _svc
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return req.headers.get("x-real-ip") || "unknown"
}

function makeWindowKey(ip: string, windowMs: number): string {
  const now = Date.now()
  const windowStart = Math.floor(now / windowMs) * windowMs
  return `${ip}:${windowStart}`
}

export async function isRateLimited(ip: string, max: number = 30, windowMs: number = 60_000): Promise<boolean> {
  try {
    const svc = getSvc()
    const now = Date.now()
    const windowStart = Math.floor(now / windowMs) * windowMs
    const windowStartISO = new Date(windowStart).toISOString()

    const { data: existing } = await (svc
      .from("rate_limits") as unknown as { select: (s: string) => { eq: (col: string, val: string) => { single: () => Promise<{ data: Record<string, unknown> | null; error: unknown }> } } })
      .select("count, window_start")
      .eq("ip", ip)
      .single()

    if (!existing || new Date(existing.window_start as string).getTime() < windowStart) {
      const { error: upsertError } = await (svc
        .from("rate_limits") as unknown as { upsert: (row: Record<string, unknown>, opts: { onConflict: string }) => Promise<{ error: unknown }> })
        .upsert({ ip, count: 1, window_start: windowStartISO }, { onConflict: "ip" })
      if (upsertError) {
        console.error("rate-limit upsert error:", upsertError)
        return false
      }
      return false
    }

    if ((existing.count as number) >= max) return true

    const { error: updateError } = await (svc
      .from("rate_limits") as unknown as { update: (row: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: unknown }> } })
      .update({ count: (existing.count as number) + 1 })
      .eq("ip", ip)
    if (updateError) {
      console.error("rate-limit update error:", updateError)
      return false
    }
    return false
  } catch (e) {
    console.error("rate-limit error — failing open:", e)
    return false
  }
}
