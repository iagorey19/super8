"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import * as store from "@/lib/store"
import type { Tournament } from "@/lib/types"

type AthleteWithNumber = { athlete_id: string; name: string; number?: number; category?: string }

export default function SortearNumeros() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedTournament, setSelectedTournament] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [athletes, setAthletes] = useState<AthleteWithNumber[]>([])
  const [hasDrawn, setHasDrawn] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [rollingNumber, setRollingNumber] = useState<number | null>(null)
  const [currentAthleteName, setCurrentAthleteName] = useState("")
  const [currentCategory, setCurrentCategory] = useState("")
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null)
  const [athletesWithoutNumber, setAthletesWithoutNumber] = useState<AthleteWithNumber[]>([])
  const [drawingAthlete, setDrawingAthlete] = useState<AthleteWithNumber | null>(null)

  function loadTournaments() {
    const all = store.getTournaments()
    setTournaments(all)
  }

  const tournamentCategories = currentTournament?.categories || []
  const hasMultipleCategories = tournamentCategories.length > 1

  function loadAthletes() {
    if (!selectedTournament) {
      setAthletes([])
      setHasDrawn(false)
      setAthletesWithoutNumber([])
      return
    }
    const cat = hasMultipleCategories && selectedCategory ? selectedCategory : undefined
    const regs = store.getRegisteredAthletes(selectedTournament, cat)
    const approved = regs.filter((r) => r.status === "approved")
    const hasNumbers = approved.some((r) => r.draw_number != null)
    const mapped = approved.map((r) => ({ athlete_id: r.athlete_id, name: r.name, number: r.draw_number, category: r.category }))
    const withoutNum = mapped.filter((a) => a.number == null)
    setAthletesWithoutNumber(withoutNum)
    if (hasNumbers) {
      const sorted = [...mapped].sort((a, b) => (a.number || 0) - (b.number || 0))
      setAthletes(sorted)
      setHasDrawn(true)
    } else {
      setAthletes(mapped)
      setHasDrawn(false)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
      return
    }
    if (user) loadTournaments()
  }, [user, loading, router])

  useEffect(() => {
    setCurrentTournament(selectedTournament ? store.getTournamentById(selectedTournament) ?? null : null)
  }, [selectedTournament])

  useEffect(() => {
    loadAthletes()
  }, [selectedTournament, selectedCategory])

  const animateDraw = useCallback(() => {
    if (hasMultipleCategories && !selectedCategory) return
    if (athletesWithoutNumber.length === 0) return
    setIsAnimating(true)

    const names = athletesWithoutNumber.map((a) => a.name)
    const usedNumbers = new Set(athletes.filter((a) => a.number != null).map((a) => a.number))
    const availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8].filter((n) => !usedNumbers.has(n))

    setDrawingAthlete(athletesWithoutNumber[0])
    setCurrentAthleteName(names[0])
    setCurrentCategory(athletesWithoutNumber[0].category || selectedCategory)

    const totalSteps = 15
    let step = 0
    const interval = setInterval(() => {
      setCurrentAthleteName(names[step % names.length])
      setRollingNumber(availableNumbers[Math.floor(Math.random() * availableNumbers.length)])
      step++
      if (step >= totalSteps) {
        clearInterval(interval)
        const cat = hasMultipleCategories && selectedCategory ? selectedCategory : undefined
        const result = store.drawSingleNumber(selectedTournament, cat)
        if (result) {
          setCurrentAthleteName(result.name)
          setRollingNumber(result.number)
          loadAthletes()
          setTimeout(() => {
            setDrawingAthlete(null)
            setRollingNumber(null)
            setIsAnimating(false)
          }, 1500)
        } else {
          setIsAnimating(false)
        }
      }
    }, 200)
  }, [athletes, athletesWithoutNumber, selectedTournament, selectedCategory, hasMultipleCategories])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (!user) return null

  const allDrawn = athletes.length > 0 && athletesWithoutNumber.length === 0

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight animate-fade-in">
          SORTEIO - Números dos Atletas
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Clique em "Sortear" para definir o número de cada atleta, um por vez</p>
      </div>

      <Card>
        <CardHeader title="Selecionar Torneio" />
        <div className="max-w-md space-y-3">
          <Select
            label="Torneio"
            options={[
              { value: "", label: "Selecione um torneio..." },
              ...tournaments.map((t) => ({ value: t.id, label: `${t.title} - ${t.edition}` })),
            ]}
            value={selectedTournament}
            onChange={(e) => {
              setSelectedTournament(e.target.value)
              setSelectedCategory("")
            }}
          />
          {hasMultipleCategories && selectedTournament && (
            <Select
              label="Categoria"
              options={[
                { value: "", label: "Selecione a categoria..." },
                ...tournamentCategories.map((cat) => ({
                  value: cat,
                  label: cat === "4e5" ? "Categoria 4e5" : "Categoria 6e7",
                })),
              ]}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
          )}
        </div>
      </Card>

      {selectedTournament && athletes.length > 0 && (
        <Card>
          <CardHeader
            title={selectedCategory ? `Atletas - ${selectedCategory}` : "Atletas"}
            subtitle={
              allDrawn
                ? "Todos os números sorteados! 🎉"
                : `${athletesWithoutNumber.length} atleta(s) aguardando número`
            }
            action={
              !allDrawn && !isAnimating ? (
                <Button
                  size="lg"
                  onClick={animateDraw}
                  disabled={hasMultipleCategories && !selectedCategory || athletesWithoutNumber.length === 0}
                >
                  {athletesWithoutNumber.length > 0
                    ? `Sortear ${athletesWithoutNumber[0].name} 🎲`
                    : "Sortear Número"}
                </Button>
              ) : null
            }
          />

          {isAnimating && drawingAthlete && (
            <div className="text-center py-8 space-y-6">
              <div className="animate-pulse">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Sorteando...</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{currentAthleteName}</p>
                {currentCategory && (
                  <Badge className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 mt-2">
                    {currentCategory === "4e5" ? "Categoria 4e5" : "Categoria 6e7"}
                  </Badge>
                )}
              </div>
              <div className="text-8xl font-black text-amber-600 dark:text-amber-400 animate-pulse">
                {rollingNumber}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {athletes.map((athlete) => {
              const isPending = athlete.number == null
              return (
                <div
                  key={athlete.athlete_id}
                  className={`relative bg-gradient-to-br rounded-2xl border-2 p-6 text-center transition-all duration-500 ${
                    athlete.number != null
                      ? "from-amber-50 to-orange-50 border-amber-200 opacity-100"
                      : "from-gray-50 to-gray-100 border-gray-200 dark:border-gray-700 opacity-60"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 truncate">{athlete.name}</p>
                  {athlete.category && (
                    <Badge className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 mb-2">{athlete.category}</Badge>
                  )}
                  <div className="text-5xl font-black text-amber-600 dark:text-amber-400">
                    {athlete.number != null ? athlete.number : "?"}
                  </div>
                  {athlete.number != null && athlete.number === 1 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">🏆 Cabeça de chave</p>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {selectedTournament && athletes.length === 0 && !isAnimating && (
        <Card>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Nenhum atleta aprovado encontrado{selectedCategory ? ` na categoria ${selectedCategory}` : ""}.
          </p>
        </Card>
      )}

      <div className="text-center">
        <Link href="/admin" className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 font-medium">
          ← Nova Edição
        </Link>
      </div>
    </div>
  )
}
