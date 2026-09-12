// Gera public/version.json a cada build (rodado via `prebuild`).
// O <VersionCheck /> compara esse hash e recarrega o app quando muda (guia 23).
const fs = require("fs")
const path = require("path")

const now = new Date()
const pad = (n) => String(n).padStart(2, "0")
const version = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`

const out = {
  version,
  buildTime: now.toISOString(),
}

fs.writeFileSync(path.join(__dirname, "..", "public", "version.json"), JSON.stringify(out, null, 2) + "\n")
console.log(`[version] public/version.json -> ${version}`)
