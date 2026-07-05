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
  const { data: users, error } = await svc.from("users").select("id, email, password, name, role")
  if (error) {
    console.error("Failed to fetch users:", error.message)
    process.exit(1)
  }

  const withPassword = (users || []).filter((u: any) => u.password).filter(Boolean)
  console.log(`\nTotal users: ${users?.length || 0}`)
  console.log(`Users with password: ${withPassword.length}\n`)

  let created = 0
  let skipped = 0
  let errors = 0

  for (const u of withPassword) {
    const { error: createError } = await svc.auth.admin.createUser({
      email: u.email,
      password_hash: u.password,
      email_confirm: true,
    })
    if (createError) {
      if (createError.message?.includes("already been registered") || createError.message?.includes("already exists")) {
        console.log(`  SKIP ${u.email.padEnd(35)} already in Auth`)
        skipped++
      } else {
        console.error(`  ERR  ${u.email.padEnd(35)} ${createError.message}`)
        errors++
      }
    } else {
      console.log(`  OK   ${u.email.padEnd(35)} created in Auth`)
      created++
    }
  }

  console.log(`\n✓ Created: ${created} | Skipped: ${skipped} | Errors: ${errors}`)
}

main().catch(console.error)
