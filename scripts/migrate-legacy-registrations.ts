import { createClient } from "@supabase/supabase-js"
import { join } from "path"

process.loadEnvFile(join(__dirname, "..", ".env.local"))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars in .env.local")
  process.exit(1)
}

const svc = createClient(supabaseUrl, supabaseKey)

async function main() {
  const [regRes, tourRes] = await Promise.all([
    svc.from("athlete_registrations").select("*"),
    svc.from("tournaments").select("id, registration_fee"),
  ])

  if (regRes.error) { console.error("Failed to fetch registrations:", regRes.error.message); process.exit(1) }
  if (tourRes.error) { console.error("Failed to fetch tournaments:", tourRes.error.message); process.exit(1) }

  const registrations = regRes.data || []
  const tournaments = tourRes.data || []
  const feeMap = new Map(tournaments.map((t: any) => [t.id, t.registration_fee]))

  console.log(`Total registrations: ${registrations.length}`)

  const groups = new Map<string, any[]>()
  for (const r of registrations) {
    const key = `${r.tournament_id}|${r.category || "4e5"}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(r)
  }

  const BATCH_SIZE = 50
  let updated = 0
  let skipped = 0

  for (const [key, group] of groups) {
    group.sort((a: any, b: any) => {
      const aDate = a.created_at || "2000-01-01"
      const bDate = b.created_at || "2000-01-01"
      return aDate.localeCompare(bDate)
    })

    const [tournamentId] = key.split("|")
    const hasFee = !!feeMap.get(tournamentId)

    for (let i = 0; i < group.length; i++) {
      const r = group[i]
      const order = i + 1
      const isWaiting = order > 8

      const updates: Record<string, any> = {}

      if (r.registration_order !== order) updates.registration_order = order
      if (r.is_waiting !== isWaiting) updates.is_waiting = isWaiting
      if (hasFee && !r.payment_status && r.status === "approved") updates.payment_status = "pending"
      if (hasFee && !r.payment_status && r.status === "pending") updates.payment_status = "pending"

      if (Object.keys(updates).length === 0) {
        skipped++
        continue
      }

      const { error } = await svc.from("athlete_registrations").update(updates).eq("id", r.id)
      if (error) {
        console.error(`  ERR ${r.id.slice(0, 8)}: ${error.message}`)
      } else {
        updated++
      }
    }
  }

  console.log(`\n✓ Updated: ${updated} | Skipped (no changes): ${skipped}`)
}

main().catch(console.error)
