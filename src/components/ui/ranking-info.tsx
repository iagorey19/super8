"use client"

import { useState } from "react"

export function RankingInfo() {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <span className="text-lg">{open ? "📖" : "❓"}</span>
        <span>Sistema de Pontuação e Desempate</span>
        <span className="ml-auto text-gray-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">📊 Pontuação por Etapa</h4>
            <p>Cada etapa vale pontos de acordo com a colocação:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li><strong>1º lugar</strong> → 8 pontos</li>
              <li><strong>2º lugar</strong> → 7 pontos</li>
              <li><strong>3º lugar</strong> → 6 pontos</li>
              <li><strong>4º lugar</strong> → 5 pontos</li>
              <li><strong>5º lugar</strong> → 4 pontos</li>
              <li><strong>6º lugar</strong> → 3 pontos</li>
              <li><strong>7º lugar</strong> → 2 pontos</li>
              <li><strong>8º lugar</strong> → 1 ponto</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">🏆 Pontuação Final do Torneio</h4>
            <p>A classificação final considera a <strong>soma de games</strong> (total de games marcados em todas as partidas). Os pontos da tabela acima definem a pontuação para o <strong>Ranking Anual</strong>.</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">⚖️ Critério de Desempate</h4>
            <p>Em caso de empate na pontuação final, a ordem é definida por:</p>
            <ol className="list-decimal list-inside mt-1 space-y-0.5">
              <li><strong>Total de games</strong> — quem fez mais games (soma dos games marcados em todas as partidas)</li>
              <li><strong>Saldo</strong> — diferença entre games marcados e sofridos (scored - conceded)</li>
              <li><strong>Confronto direto</strong> — quem venceu mais vezes o duelo direto entre os atletas empatados</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">📅 Ranking Anual</h4>
            <p>
              O ranking anual acumula os pontos de <strong>todos os torneios do ano</strong> (8 pts para o 1º, 7 para o 2º, etc.).
              O número de games é normalizado para uma base de <strong>5 games por partida</strong>,
              garantindo equilíbrio entre torneios com pontuações máximas diferentes.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
