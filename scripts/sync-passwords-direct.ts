import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
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
  const dbPath = join(__dirname, "..", "data", "super8-db.json")
  const db = JSON.parse(readFileSync(dbPath, "utf-8"))

  // Find users whose password changed
  const { data: existing } = await svc.from("users").select("id, password")
  const oldMap = new Map(existing?.map((u: any) => [u.id, u.password]) ?? [])

  const changed = db.users.filter((u: any) => {
    const old = oldMap.get(u.id)
    return old && old !== u.password
  })

  console.log(`${changed.length} users with password changes:\n`)
  for (const u of changed) {
    console.log(`  ${u.name.padEnd(35)} ${(oldMap.get(u.id) || "").padEnd(20)} → ${u.password}`)
  }

  if (changed.length === 0) {
    console.log("No changes needed.")
    return
  }

  // Upsert only changed users
  const { error } = await svc.from("users").upsert(changed, {
    onConflict: "id",
    ignoreDuplicates: false,
  })

  if (error) {
    console.error("Erro no upsert:", error.message)
    process.exit(1)
  }

  console.log(`\n✓ ${changed.length} senhas atualizadas no Supabase!`)
}

main().catch(console.error)
