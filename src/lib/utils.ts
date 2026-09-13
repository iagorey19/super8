export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function formatDate(dateStr: string): string {
  const d = dateStr.includes("T") ? new Date(dateStr) : new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function formatDateWithWeekday(dateStr: string): string {
  const d = dateStr.includes("T") ? new Date(dateStr) : new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function formatDateShort(dateStr: string): string {
  const d = dateStr.includes("T") ? new Date(dateStr) : new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    upcoming: "bg-blue-100 text-blue-800",
    registering: "bg-indigo-100 text-indigo-800",
    ongoing: "bg-green-100 text-green-800",
    completed: "bg-gray-200 text-gray-700",
    live: "bg-green-100 text-green-800 animate-pulse",
    finished: "bg-blue-100 text-blue-800",
  }
  return colors[status] || "bg-gray-200 text-gray-700"
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pendente",
    approved: "Confirmado",
    rejected: "Recusado",
    upcoming: "Agendado",
    registering: "Inscrições Abertas",
    ongoing: "Em Andamento",
    completed: "Encerrado",
    live: "Ao Vivo",
    finished: "Finalizado",
  }
  return labels[status] || status
}

export function getTournamentStatusLabel(status: string, registrationsClosed?: boolean): string {
  if (status === "registering" && registrationsClosed) return "Inscrições Encerradas"
  return getStatusLabel(status)
}

export function getTournamentStatusColor(status: string, registrationsClosed?: boolean): string {
  if (status === "registering" && registrationsClosed) return "bg-red-100 text-red-800"
  return getStatusColor(status)
}

export function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    "4e5": "4ª e 5ª Categoria",
    "6e7": "6ª e 7ª Categoria",
    premiacao: "Premiação",
    estrutura: "Estrutura",
    marketing: "Marketing",
    arbitragem: "Arbitragem",
    alimentacao: "Alimentação",
    fotografia: "Fotografia",
    brindes: "Brindes",
    outros: "Outros",
  }
  return labels[cat] || cat
}

export function getCategoryIcon(cat: string): string {
  const icons: Record<string, string> = {
    premiacao: "🏆",
    estrutura: "🏟️",
    marketing: "📢",
    arbitragem: "⚖️",
    alimentacao: "🍽️",
    fotografia: "📸",
    brindes: "🎁",
    outros: "📦",
  }
  return icons[cat] || "📌"
}

export function getRevenueSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    patrocinio: "Patrocínio",
    inscricao: "Inscrição",
    outros: "Outros",
  }
  return labels[source] || source
}

export function getRevenueSourceIcon(source: string): string {
  const icons: Record<string, string> = {
    patrocinio: "🤝",
    inscricao: "📝",
    outros: "📦",
  }
  return icons[source] || "📋"
}

export function stripPassword<U extends Record<string, unknown>>(u: U): Omit<U, "password"> {
  const copy = { ...u }
  delete copy.password
  return copy
}

// Critério que decidiu a posição de uma linha do ranking em relação à anterior:
// null = venceu nos games (sem desempate); "saldo" | "h2h" = desempate aplicado.
export function tiebreakSeal(
  prev: { total_games: number; saldo?: number | null } | undefined,
  cur: { total_games: number; saldo?: number | null }
  ): "saldo" | "h2h" | null {
    if (!prev) return null
    if (prev.total_games !== cur.total_games) return null
    if ((prev.saldo ?? 0) !== (cur.saldo ?? 0)) return "saldo"
    return "h2h"
  }

  // Selo para tabelas que intercalam categorias/grupos: compara com a linha
  // anterior DO MESMO grupo/categoria em vez da vizinha imediata.
  export function sealForRow(
    rows: { category?: string; group_name?: string | null; total_games: number; saldo?: number | null }[],
    idx: number
  ): "saldo" | "h2h" | null {
    const cur = rows[idx]
    if (!cur) return null
    for (let i = idx - 1; i >= 0; i--) {
      const p = rows[i]
      if (p.category === cur.category && (p.group_name || "A") === (cur.group_name || "A")) {
        return tiebreakSeal(p, cur)
      }
    }
    return null
  }

export function exportToCSV(headers: string[], rows: string[][], filename: string) {
  const BOM = "\uFEFF"
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`
  const csv = BOM + headers.map(escape).join(";") + "\r\n" +
    rows.map((row) => row.map(escape).join(";")).join("\r\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = filename.replace(/[^a-zA-Z0-9._-]/g, "_") + ".csv"
  a.click()
  URL.revokeObjectURL(a.href)
}

export function getTierLabel(tier: string): string {
  const labels: Record<string, string> = {
    gold: "Ouro",
    silver: "Prata",
    bronze: "Bronze",
  }
  return labels[tier] || tier
}
