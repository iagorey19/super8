const API = "https://super8-three.vercel.app/api/data"

const records = [
  { id: "ath-001", name: "Dani Mandeli", email: "DaniMandeli@email.com", password: "DaniMandeli123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-002", name: "Rania", email: "Rania@email.com", password: "Rania123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-003", name: "Chintia Tridapala", email: "ChintiaTridapala@email.com", password: "ChintiaTridapala123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-004", name: "Patricia Rey", email: "PatriciaRey@email.com", password: "PatriciaRey123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-005", name: "Mel", email: "Mel@email.com", password: "Mel123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-006", name: "Nathiely Andrade", email: "NathielyAndrade@email.com", password: "NathielyAndrade123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-007", name: "Larissa Fuganti", email: "LarissaFuganti@email.com", password: "LarissaFuganti123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-008", name: "Ana Heloisa Neves", email: "AnaHeloisa@email.com", password: "AnaHeloisa123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-009", name: "Joelma Espindola", email: "JoelmaEspindola@email.com", password: "JoelmaEspindola123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-010", name: "Pamela Selent", email: "PamelaSelent@email.com", password: "PamelaSelent123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-011", name: "Monique Petkow", email: "MoniquePetkow@email.com", password: "MoniquePetkow123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-012", name: "Silvia Sassi", email: "SilviaSassi@email.com", password: "SilviaSassi123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-014", name: "Leziane Teixeira", email: "LezianeTeixeira@email.com", password: "LezianeTeixeira123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-015", name: "Alexia Andrade", email: "AlexiaAndrade@email.com", password: "AlexiaAndrade123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-016", name: "Stephany Padilha Guimarães", email: "StephanyPadilha@email.com", password: "StephanyPadilha123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-017", name: "Jessica Ferrari", email: "JessicaFerrari@email.com", password: "JessicaFerrari123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-018", name: "Paty Blu", email: "PatyBlu@email.com", password: "PatyBlu123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-019", name: "Dani Darrazao", email: "DaniDarrazao@email.com", password: "DaniDarrazao123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-020", name: "Tati Fondini", email: "TatiFondini@email.com", password: "TatiFondini123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-021", name: "Ana Ternes", email: "AnaTernes@email.com", password: "AnaTernes123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-022", name: "Alessandra Truppel", email: "AlessandraTruppel@email.com", password: "AlessandraTruppel123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "ath-023", name: "Emanuela Lacerda", email: "EmanuelaLacerda@email.com", password: "EmanuelaLacerda123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
  { id: "2fce5441-9b33-43e3-834c-98b1785e3610", name: "Luiza Vilas Boas", email: "LuizaVilasBoas@email.com", password: "LuizaVilas123", role: "athlete", phone: "", created_at: "2026-01-15T00:00:00.000Z" },
]

async function main() {
  console.log(`Enviando ${records.length} registros para ${API}...`)
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table: "users", records }),
  })
  const text = await res.text()
  console.log(`Resposta (${res.status}): ${text}`)
  if (res.ok) {
    console.log("✓ Senhas atualizadas no Supabase!")
  } else {
    console.error("✗ Erro:", text)
    process.exit(1)
  }
}

main().catch(console.error)
