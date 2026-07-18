import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSvc() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function getClientIp(req: Request): string {
  return req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "unknown"
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

    const { data: existing } = await svc
      .from("rate_limits")
      .select("count, window_start")
      .eq("ip", ip)
      .single()

    if (!existing || new Date(existing.window_start).getTime() < windowStart) {
      const { error: upsertError } = await svc
        .from("rate_limits")
        .upsert({ ip, count: 1, window_start: windowStartISO }, { onConflict: "ip" })
      if (upsertError) console.error("rate-limit upsert error:", upsertError)
      return false
    }

    if (existing.count >= max) return true

    const { error: updateError } = await svc
      .from("rate_limits")
      .update({ count: existing.count + 1 })
      .eq("ip", ip)
    if (updateError) console.error("rate-limit update error:", updateError)
    return false
  } catch (e) {
    console.error("rate-limit error — failing secure:", e)
    return true
  }
}
