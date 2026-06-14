"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import * as store from "@/lib/store"
import type { RaffleRecord } from "@/lib/types"

interface Participant {
  id: string
  name: string
}

export default function SortearBrindes() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [participants, setParticipants] = useState<Participant[]>([])
  const [newName, setNewName] = useState("")
  const [prize, setPrize] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [scrollingName, setScrollingName] = useState("")
  const [winner, setWinner] = useState<Participant | null>(null)
  const [records, setRecords] = useState<RaffleRecord[]>([])
  const scrollRef = useRef<ReturnType<typeof setInterval>>(null)

  const [tournaments, setTournaments] = useState<any[]>([])
  const [selectedTournamentId, setSelectedTournamentId] = useState("")
  const [sorteioBrindes, setSorteioBrindes] = useState<any[]>([])
  const [apoiadores, setApoiadores] = useState<any[]>([])

  useEffect(() => {
    const all = store.getTournaments()
    setTournaments(all)
    const current = store.getCurrentTournament()
    if (current) setSelectedTournamentId(current.id)
  }, [])

  useEffect(() => {
    if (selectedTournamentId) {
      setSorteioBrindes(store.getBrindes(selectedTournamentId, "sorteio"))
      setApoiadores(store.getApoiadores(selectedTournamentId))
      setRecords(store.getRaffleRecords(selectedTournamentId))
    } else {
      setSorteioBrindes([])
      setApoiadores([])
      setRecords([])
    }
  }, [selectedTournamentId])

  function handleAddName() {
    const trimmed = newName.trim()
    if (!trimmed) return
    setParticipants((prev) => [...prev, { id: crypto.randomUUID(), name: trimmed }])
    setNewName("")
  }

  function handleRemove(id: string) {
    setParticipants((prev) => prev.filter((p) => p.id !== id))
  }

  function handleImportAthletes() {
    const current = store.getCurrentTournament()
    if (!current) {
      alert("Nenhum torneio atual ou próximo encontrado.")
      return
    }
    const regs = store.getRegisteredAthletes(current.id)
    const approved = regs.filter((r) => r.status === "approved")
    const names = approved.map((r) => r.name)
    setParticipants((prev) => {
      const existing = new Set(prev.map((p) => p.name))
      const newOnes = names.filter((n) => !existing.has(n))
      return [...prev, ...newOnes.map((n) => ({ id: crypto.randomUUID(), name: n }))]
    })
  }

  function handleAutoRaffle(brindeId: string) {
    if (!selectedTournamentId) return

    const participantsNames = participants.map((p) => p.name)
    if (participantsNames.length === 0) {
      alert("Adicione participantes primeiro.")
      return
    }

    setIsAnimating(true)
    setWinner(null)

    let step = 0
    const totalSteps = 20
    scrollRef.current = setInterval(() => {
      const randomName = participantsNames[Math.floor(Math.random() * participantsNames.length)]
      setScrollingName(randomName)
      step++

      if (step >= totalSteps) {
        clearInterval(scrollRef.current!)
        const slowSteps = 10
        let slow = 0
        const slowInterval = setInterval(() => {
          const randomName = participantsNames[Math.floor(Math.random() * participantsNames.length)]
          setScrollingName(randomName)
          slow++

          if (slow >= slowSteps) {
            clearInterval(slowInterval)

            const result = store.raffleBrinde(selectedTournamentId)
            if (!result) {
              alert("Nenhum brinde disponível para sorteio.")
              setIsAnimating(false)
              setScrollingName("")
              return
            }

            const found = participants.find((p) => p.name === result.winner.name)
            setWinner(found || { id: result.winner.id, name: result.winner.name })
            setScrollingName("")
            setIsAnimating(false)
            setRecords(store.getRaffleRecords(selectedTournamentId))
            setSorteioBrindes(store.getBrindes(selectedTournamentId, "sorteio"))
          }
        }, 150)
      }
    }, 100)
  }

  function handleDraw() {
    if (participants.length === 0) return
    const prizeName = prize.trim() || "Brinde"

    setIsAnimating(true)
    setWinner(null)

    const names = participants.map((p) => p.name)
    let step = 0
    const totalSteps = 20

    scrollRef.current = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)]
      setScrollingName(randomName)
      step++

      if (step >= totalSteps) {
        clearInterval(scrollRef.current!)

        const slowSteps = 10
        let slow = 0
        const slowInterval = setInterval(() => {
          const randomName = names[Math.floor(Math.random() * names.length)]
          setScrollingName(randomName)
          slow++

          if (slow >= slowSteps) {
            clearInterval(slowInterval)
            const winnerIdx = Math.floor(Math.random() * participants.length)
            const drawn = participants[winnerIdx]
            setWinner(drawn)
            setScrollingName("")
            setIsAnimating(false)
            store.recordRaffle(selectedTournamentId, prizeName, drawn.name)
            setRecords(store.getRaffleRecords(selectedTournamentId))
          }
        }, 150)
      }
    }, 100)
  }

  function handleRemoveWinner() {
    if (winner) {
      setParticipants((prev) => prev.filter((p) => p.name !== winner.name))
      setWinner(null)
    }
  }

  function handleKeepWinner() {
    setWinner(null)
  }

  useEffect(() => {
    return () => {
      if (scrollRef.current) clearInterval(scrollRef.current)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          SORTEIO - Brindes
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Sorteie brindes entre os participantes</p>
      </div>

      <Card>
        <CardHeader title="Torneio" />
        <Select
          label="Selecione o torneio"
          options={[
            { value: "", label: "Selecione..." },
            ...tournaments.map((t) => ({ value: t.id, label: `${t.title} - ${t.edition}` })),
          ]}
          value={selectedTournamentId}
          onChange={(e) => setSelectedTournamentId(e.target.value)}
        />
      </Card>

      {sorteioBrindes.length > 0 && (
        <Card>
          <CardHeader
            title="🎁 Brindes para Sorteio"
            subtitle="Brindes doados pelos apoiadores disponíveis para sorteio"
          />
          <div className="flex flex-wrap gap-2">
            {sorteioBrindes.map((b) => {
              const apoiador = apoiadores.find((a: any) =>
                a.brindes.some((br: any) => br.id === b.id)
              )
              return (
                <div key={b.id} className="bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{b.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Doado por: {apoiador?.name || "Desconhecido"}</p>
                  </div>
                  <Button size="sm" variant="success" onClick={() => handleAutoRaffle(b.id)}>
                    Sortear
                  </Button>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Participantes"
          subtitle={`${participants.length} participante(s)`}
        />
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Nome do participante"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddName()}
              />
            </div>
            <Button onClick={handleAddName}>Adicionar</Button>
          </div>
          <Button variant="secondary" onClick={handleImportAthletes}>
            Importar Atletas do Torneio
          </Button>
          {participants.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {p.name}
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Realizar Sorteio" />
        <div className="space-y-6">
          <div className="max-w-sm">
            <Input
              label="Prêmio"
              placeholder="Ex: Camiseta oficial"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
            />
          </div>

          {isAnimating && (
            <div className="text-center py-8">
              <div className="text-6xl font-black text-amber-600 dark:text-amber-400 animate-pulse mb-4">
                {scrollingName}
              </div>
              <p className="text-gray-400 dark:text-gray-500">Sorteando...</p>
            </div>
          )}

          {!isAnimating && !winner && (
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleDraw}
                disabled={participants.length === 0}
              >
                SORTEAR 🎲
              </Button>
            </div>
          )}

          {winner && !isAnimating && (
            <div className="text-center bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-300 p-8 space-y-3">
              <div className="text-5xl">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">VENCEDOR</h2>
              <div className="text-4xl font-black text-amber-600 dark:text-amber-400">
                {winner.name}
              </div>
              {prize.trim() && (
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  Prêmio: <span className="font-semibold text-gray-700 dark:text-gray-300">{prize.trim()}</span>
                </p>
              )}
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="danger" onClick={handleRemoveWinner}>
                  Remover Vencedor da Lista
                </Button>
                <Button variant="secondary" onClick={handleKeepWinner}>
                  Manter na Lista
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {records.length > 0 && (
        <Card>
          <CardHeader title="Histórico de Sorteios" />
          <div className="space-y-2">
            {records.map((record, idx) => (
              <div
                key={record.id}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-950 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🎁</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{record.winner_name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{record.brinde_description}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">#{idx + 1}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
