/**
 * Atualiza senhas no padrão NomePrimeiroSobrenome123
 * Uso: npx tsx scripts/update-passwords.ts
 */

import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function newPassword(name: string): string {
  const parts = normalize(name).trim().split(/\s+/)
  if (parts.length <= 2) {
    return parts.join("") + "123"
  }
  return parts[0] + parts[1] + "123"
}

// ─── super8-db.json ───
const dbPath = join(__dirname, "..", "data", "super8-db.json")
const db = JSON.parse(readFileSync(dbPath, "utf-8"))

const OVERRIDES: Record<string, string> = {
  "admin-001": "admin123",
  "spo-001": "patro123",
  "f0e0bbbf-9489-4538-8953-45150e9bf4d0": "Aromorie123",
}

for (const u of db.users) {
  if (OVERRIDES[u.id]) {
    u.password = OVERRIDES[u.id]
    console.log(`  ${u.name.padEnd(35)} → ${u.password} (mantida)`)
    continue
  }
  const old = u.password
  u.password = newPassword(u.name)
  if (old !== u.password) {
    console.log(`  ${u.name.padEnd(35)} ${old.padEnd(20)} → ${u.password}`)
  }
}

writeFileSync(dbPath, JSON.stringify(db, null, 2) + "\n", "utf-8")
console.log(`\n✓ super8-db.json atualizado (${db.users.length} usuários)`)

// ─── seed.ts ───
const seedPath = join(__dirname, "..", "src", "lib", "seed.ts")
let seed = readFileSync(seedPath, "utf-8")

const SEED_OVERRIDES: Record<string, string> = {
  "admin-001": "admin123",
  "spo-001": "patro123",
}

for (const u of db.users) {
  if (!u.id.startsWith("ath-")) continue
  const pwd = newPassword(u.name)
  const oldPwd = "atleta123"

  const regex = new RegExp(
    `(id:\\s*"${u.id}"[\\s\\S]*?password:\\s*)"${oldPwd}"`,
  )
  seed = seed.replace(regex, `$1"${pwd}"`)
}

writeFileSync(seedPath, seed, "utf-8")
console.log(`✓ seed.ts atualizado`)
console.log("\nPronto! Agora rode o script para sincronizar com o Supabase.")
