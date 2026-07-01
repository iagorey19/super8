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

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
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
    registering: "bg-purple-100 text-purple-800",
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
    approved: "Aprovado",
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

export function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
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
