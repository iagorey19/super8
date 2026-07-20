"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import * as store from "@/lib/store"
import { sanitizeUrl } from "@/lib/validate-url"
import { getStatusColor, getStatusLabel, getTournamentStatusLabel, getTournamentStatusColor, getCategoryLabel, formatDateWithWeekday } from "@/lib/utils"
import { generatePixPayload, generatePixQR, formatCurrency, generateWhatsAppLink } from "@/lib/pix"
import type { Tournament, RaffleRecord, AthleteRegistration, TournamentResultWithName, Sponsorship, ApoiadorWithBrindes, Brinde, RegistrationWithName } from "@/lib/types"

export default function EventoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [raffleRecords, setRaffleRecords] = useState<RaffleRecord[]>([])
  const [registrations, setRegistrations] = useState<RegistrationWithName[]>([])
  const [sponsors, setSponsors] = useState<(Sponsorship & { sponsor_name: string; sponsor_url?: string })[]>([])
  const [apoiadores, setApoiadores] = useState<ApoiadorWithBrindes[]>([])
  const [session, setSession] = useState<{ user: { id: string; name: string; role: string } } | null>(null)
  const [myReg, setMyReg] = useState<AthleteRegistration | null>(null)
  const [step, setStep] = useState<"idle" | "category" | "pix" | "done">("idle")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [pixPayload, setPixPayload] = useState("")
  const [pixQR, setPixQR] = useState("")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sendingPayment, setSendingPayment] = useState(false)
  const { toast } = useToast()
  const [showInscritos, setShowInscritos] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)

  const loadData = useCallback(async () => {
    try { await store.refreshFromServer() } catch (e) { console.error("refreshFromServer failed:", e) }
    const t = store.getTournamentById(id)
    setTournament(t ?? null)
    if (t) {
      setRaffleRecords(store.getRaffleRecords(id))
      setRegistrations(store.getRegisteredAthletes(id))
      setSponsors(store.getSponsorships(id))
      setApoiadores(store.getApoiadores(id))
    }
    const sess = store.getSession()
    setSession(sess)
    if (sess?.user && sess.user.role === "athlete") {
      setMyReg(store.getAthleteRegistration(id, sess.user.id) ?? null)
    }
  }, [id])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [loadData])

  async function handleStartRegistration() {
    const sess = store.getSession()
    if (!sess || sess.user.role !== "athlete") {
      router.push(`/auth/login?redirect=/eventos/${id}`)
      return
    }
    const existing = store.getAthleteRegistration(id, sess.user.id) ?? null
    if (existing) {
      setMyReg(existing)
      if (existing.payment_status === "pending" && tournament?.registration_fee) {
        await generatePixForRegistration(existing, sess.user.name)
        setStep("pix")
      }
      return
    }
    if (tournament && tournament.categories.length > 1) {
      setStep("category")
    } else {
      setSelectedCategory(tournament?.categories[0] || "4e5")
      await doRegister(tournament?.categories[0] || "4e5", sess.user.id, sess.user.name)
    }
  }

  async function handleCategorySelect(cat: string) {
    const sess = store.getSession()
    if (!sess) return
    setSelectedCategory(cat)
    await doRegister(cat, sess.user.id, sess.user.name)
  }

  async function doRegister(cat: string, athleteId: string, athleteName: string) {
    setLoading(true)
    const reg = await store.registerAthleteInTournament(id, athleteId, cat)
    setLoading(false)
    if (!reg) {
      toast("Erro ao inscrever. Tente novamente.", "error")
      return
    }
    setMyReg(reg)
    toast(reg.is_waiting ? "Inscrição realizada! Você está na lista de espera." : "Inscrição realizada!")
    if (tournament?.registration_fee) {
      await generatePixForRegistration(reg, athleteName)
    }
  }

  async function generatePixForRegistration(reg: AthleteRegistration, athleteName: string) {
    const config = store.getConfig()
    if (!config.pix_key || !tournament?.registration_fee) return
    const payload = generatePixPayload( config.pix_key, tournament.registration_fee, config.pix_name || "Pagamento", config.pix_city || "Cidade")
    setPixPayload(payload)
    const qr = await generatePixQR(payload)
    setPixQR(qr)
    setStep("pix")
  }

  async function handleCopyPix() {
    try {
      await navigator.clipboard.writeText(pixPayload)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      alert("Copie manualmente o código PIX abaixo.")
    }
  }

  async function handleAlreadyPaid() {
    const sess = store.getSession()
    if (!sess || !myReg || sendingPayment) return
    setSendingPayment(true)
    const config = store.getConfig()
    const tournamentTitle = tournament?.title || "Torneio"
    const msg = `Olá! Informo que realizei o pagamento da inscrição do ${tournamentTitle}! ✅\n\n👤 ${sess.user.name}\n📧 ${sess.user.email}\n📱 ${sess.user.phone || ""}\n💰 ${formatCurrency(tournament?.registration_fee || 0)}\n📋 ID: ${myReg.id}`
    const link = generateWhatsAppLink(config.admin_whatsapp, msg)
    window.open(link, "_blank", "noopener")
    setStep("done")
    setSendingPayment(false)
    toast("Pagamento informado ao organizador!")
  }

  function handleCopyPixManual() {
    const el = document.createElement("textarea")
    el.value = pixPayload
    document.body.appendChild(el)
    el.select()
    document.execCommand("copy")
    document.body.removeChild(el)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  if (!tournament) {
    return (
      <Card>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Evento não encontrado.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/eventos" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
          &larr; Todos os eventos
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{tournament.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tournament.edition}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => window.location.reload()}>
            Atualizar
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge className={getTournamentStatusColor(tournament.status, tournament.registrations_closed)}>
          {getTournamentStatusLabel(tournament.status, tournament.registrations_closed)}
        </Badge>
        {tournament.categories?.map((cat) => (
          <Badge key={cat} className="bg-purple-100 text-purple-800">
            {getCategoryLabel(cat)}
          </Badge>
        ))}
      </div>

      {tournament.date && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Data: {formatDateWithWeekday(tournament.date)}
        </p>
      )}

      {tournament.status === "completed" && (() => {
        const champions = tournament.categories.flatMap((cat) =>
          store.getRankings(id, cat).filter((r: TournamentResultWithName) => r.position === 1)
        )
        if (champions.length === 0) return null
        return (
          <Card className="border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
            <div className="text-center space-y-4">
              <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider flex items-center justify-center gap-2">
                <span className="text-2xl">🏆</span> Campeã{champions.length > 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {champions.map((champ: TournamentResultWithName) => (
                  <div key={champ.athlete_id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700 shadow-sm">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {store.getUserName(champ.athlete_id)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {getCategoryLabel(champ.category)} — Grupo {champ.group_name}
                    </p>
                    <div className="mt-3 pt-3 border-t border-yellow-100 dark:border-yellow-800">
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                        <span className="text-lg">🏆</span> Prêmio: Tábua Oficial The Super 8
                      </p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        <img src="/images/logo-rey-madeiras.jpg" alt="REY MADEIRAS" className="inline-block w-7 h-7 object-contain align-text-bottom rounded-sm" /> REY MADEIRAS
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )
      })()}

      {tournament.status === "registering" && tournament.registrations_closed && step === "idle" && !myReg && (
        <Card className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-center py-6 space-y-2">
            <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
              Inscrições Encerradas
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              As inscrições para este torneio foram encerradas. Aguarde o início das partidas.
            </p>
          </div>
        </Card>
      )}

      {tournament.status === "registering" && !tournament.registrations_closed && step === "idle" && !myReg && (
        showRegistration ? (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
            <div className="text-center space-y-4">
              <button
                onClick={() => setShowRegistration(false)}
                className="w-full flex items-center justify-between px-6 pt-4"
              >
                <p className="text-lg font-bold text-amber-800 dark:text-amber-200">
                  Quer jogar? 🎾
                </p>
                <span className="text-amber-400 dark:text-amber-500 text-lg">▲</span>
              </button>
              <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {store.getCategoryAvailability(id).map((a) => (
                    <div key={a.category} className={`text-xs rounded-lg px-3 py-2 text-center font-medium ${
                      a.available === 0
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : a.available <= 3
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    }`}>
                      {a.category === "4e5" ? "4e5" : "6e7"}: {a.registered}/{a.max} vagas
                      {a.waiting > 0 && ` · ${a.waiting} espera`}
                      {a.available === 0 && " · Lotada"}
                      {a.available > 0 && ` · ${a.available} vaga${a.available > 1 ? "s" : ""} restante${a.available > 1 ? "s" : ""}`}
                    </div>
                  ))}
                </div>
                {tournament.registration_fee && (
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Taxa de inscrição: {formatCurrency(tournament.registration_fee)}
                  </p>
                )}
                {tournament.registration_fee && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 rounded-lg px-3 py-2">
                    ⚠️ A inscrição só será confirmada após o pagamento e aprovação do organizador.
                  </p>
                )}
                {(() => {
                  const allFull = store.getCategoryAvailability(id).every((a) => a.available === 0)
                  return (
                    <>
                      {allFull && (
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">
                          Todas as categorias estão lotadas — mas você pode entrar na lista de espera.
                        </p>
                      )}
                      <Button onClick={handleStartRegistration} size="lg" className={`text-white font-bold ${allFull ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"}`} disabled={loading}>
                        {loading ? "Entrando..." : allFull ? "Entrar na lista de espera" : "Inscrever-se"}
                      </Button>
                    </>
                  )
                })()}
              </div>
            </div>
          </Card>
        ) : (
          <button
            onClick={() => setShowRegistration(true)}
            className="w-full text-left px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center justify-between gap-2"
          >
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              🎾 Quer jogar? Clique para ver as vagas disponíveis
            </span>
            <span className="text-amber-400 dark:text-amber-500 text-sm">▼</span>
          </button>
        )
      )}

      {myReg && myReg.status === "pending" && step === "idle" && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <div className="p-6 text-center space-y-3">
            <p className="text-base font-bold text-blue-800 dark:text-blue-200">
              {myReg.payment_status === "paid"
                ? "Inscrição confirmada! Aguardando aprovação do organizador."
                : tournament?.registration_fee
                ? "Pré-inscrição realizada! Clique abaixo para gerar o PIX."
                : "Inscrição realizada! Aguardando aprovação do organizador."}
            </p>
            {myReg.is_waiting && (
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                ⏳ Você está na lista de espera (posição {myReg.registration_order})
              </p>
            )}
            {!myReg.is_waiting && myReg.registration_order && (
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Sua posição: {myReg.registration_order}º
              </p>
            )}
            {tournament?.registration_fee && myReg.payment_status !== "paid" && (
              <>
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 rounded-lg px-3 py-2">
                  ⚠️ Após o pagamento, clique em "Já paguei" para avisar o organizador. A inscrição será confirmada após aprovação.
                </p>
                <Button onClick={handleStartRegistration} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold">
                  {loading ? "Preparando..." : "Pagar com PIX"}
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {tournament.status === "registering" && step === "category" && tournament.categories.length > 1 && (
        <Card>
          <CardHeader title="Selecione a categoria" />
          <div className="p-4 grid grid-cols-2 gap-3">
            {tournament.categories.map((cat) => {
              const a = store.getCategoryAvailability(id).find((av) => av.category === cat)
              const full = a?.available === 0
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  disabled={loading}
                  className={`p-6 rounded-xl border-2 hover:shadow-md transition-all font-bold text-lg disabled:opacity-50 ${
                    full
                      ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                      : "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200"
                  }`}
                >
                  <div>{getCategoryLabel(cat)}</div>
                  <div className="text-xs mt-1 font-normal">
                    {full
                      ? `Lista de espera · ${a?.waiting || 0} na fila`
                      : `${a?.available || 0} vaga${(a?.available || 0) > 1 ? "s" : ""} restante${(a?.available || 0) > 1 ? "s" : ""}`
                    }
                  </div>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {step === "pix" && pixPayload && (
        <Card className="border-green-200 dark:border-green-800">
          <div className="p-6 text-center space-y-4">
            <p className="text-lg font-black text-gray-900 dark:text-white">
              Pagamento via PIX
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Escaneie o QR Code ou copie o código
            </p>
            <p className="text-2xl font-black text-amber-600">
              {formatCurrency(tournament?.registration_fee || 0)}
            </p>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-inner inline-block">
              {pixQR ? (
                <img src={pixQR} alt="QR Code PIX" className="w-64 h-64 mx-auto" />
              ) : (
                <div className="w-52 h-52 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse mx-auto" />
              )}
            </div>

            {copied ? (
              <p className="text-sm text-emerald-600 font-bold">Código copiado! Cole no seu banco para pagar.</p>
            ) : pixPayload.length > 100 ? (
              <div className="space-y-2">
                <Button onClick={handleCopyPix} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 font-bold">
                  📋 Copiar código PIX
                </Button>
                <button
                  onClick={handleCopyPixManual}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Copiar manualmente
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-400 break-all">{pixPayload}</p>
            )}

            <div className="pt-4 space-y-3">
              <Button onClick={handleAlreadyPaid} disabled={sendingPayment} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base py-4">
                {sendingPayment ? "Enviando..." : "✅ Já paguei"}
              </Button>
              <p className="text-xs text-gray-400">
                Após pagar, clique em "Já paguei" para nos avisar via WhatsApp.
              </p>
            </div>
          </div>
        </Card>
      )}

      {step === "done" && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-black text-gray-900 dark:text-white">
              Pagamento informado com sucesso!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Seu pagamento será confirmado pelo organizador.
              Acompanhe o status pelo WhatsApp.
            </p>
            {(() => {
              const config = store.getConfig()
              const sess = store.getSession()
              const msg = `Olá! Informei o pagamento da inscrição do ${tournament?.title || "Torneio"}.\n\n👤 ${sess?.user?.name || ""}\n📋 ID da inscrição: ${myReg?.id || ""}`
              const link = generateWhatsAppLink(config.admin_whatsapp, msg)
              return (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg"
                >
                  💬 Falar no WhatsApp
                </a>
              )
            })()}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href={`/eventos/${id}/jogos`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer text-center py-8">
            <p className="text-3xl mb-2">🎾</p>
            <h3 className="font-semibold text-gray-900 dark:text-white">Jogos</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Acompanhe o placar ao vivo</p>
          </Card>
        </Link>
        <Link href={`/eventos/${id}/ranking`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer text-center py-8">
            <p className="text-3xl mb-2">🏆</p>
            <h3 className="font-semibold text-gray-900 dark:text-white">Ranking</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Veja a classificação do evento</p>
          </Card>
        </Link>
        <Link href="/eventos/ranking-anual">
          <Card className="hover:shadow-md transition-shadow cursor-pointer text-center py-8">
            <p className="text-3xl mb-2">📊</p>
            <h3 className="font-semibold text-gray-900 dark:text-white">Ranking Anual</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Classificação geral do ano</p>
          </Card>
        </Link>
      </div>

      {(sponsors.length > 0 || apoiadores.length > 0) && (
        <Card>
          <CardHeader title="🤝 Agradecimentos" />
          <div className="space-y-3">
            {sponsors.length > 0 && (
              <div>
                <p className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="text-lg">🏆</span> Patrocinadores
                </p>
                <div className="flex flex-wrap gap-3">
                  {sponsors.map((s: Sponsorship & { sponsor_name: string; sponsor_url?: string }) => (
                    <div key={s.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-2 border-amber-300 dark:border-amber-700 rounded-xl px-5 py-4 shadow-sm flex items-center gap-3 min-w-[200px]">
                      <span className="text-2xl">{s.tier === "gold" ? "🥇" : s.tier === "silver" ? "🥈" : "🥉"}</span>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-base">{s.sponsor_name}</p>
                        {s.sponsor_url && (
                          <a href={sanitizeUrl(s.sponsor_url, "#")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 hover:text-amber-700 mt-0.5">
                            🔗 Acesse o site
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {apoiadores.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Apoiadores</p>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const masterName = "REY MADEIRAS"
                    const master = apoiadores.find((a: ApoiadorWithBrindes) => a.name?.trim().toUpperCase() === masterName)
                    const others = apoiadores.filter((a: ApoiadorWithBrindes) => a.name?.trim().toUpperCase() !== masterName)
                    return (
                      <>
                        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2 text-sm w-full">
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-0.5">
                            🏆 Tábua Oficial The Super 8
                          </p>
                          <span className="font-medium text-gray-900 dark:text-white">REY MADEIRAS</span>
                          {master?.brindes && master.brindes.length > 0 && (
                            <span className="text-gray-600 dark:text-gray-300 ml-1">
                              - {master.brindes.map((b: Brinde) => `${b.description} (${b.type === "kit" ? "Kit" : "Sorteio"})`).join(", ")}
                            </span>
                          )}
                        </div>
                        {others.map((a: ApoiadorWithBrindes) => (
                          <div key={a.id} className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2 text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">{a.name}</span>
                            {a.brindes?.length > 0 && (
                              <span className="text-gray-600 dark:text-gray-300 ml-1">
                                - {a.brindes.map((b: Brinde) => `${b.description} (${b.type === "kit" ? "Kit" : "Sorteio"})`).join(", ")}
                              </span>
                            )}
                          </div>
                        ))}
                      </>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {raffleRecords.length > 0 && (
        <Card>
          <CardHeader title="🎁 Vencedores dos Sorteios" />
          <div className="space-y-2">
            {raffleRecords.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{r.winner_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.brinde_description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {registrations.length > 0 && (
        <Card>
          <button
            onClick={() => setShowInscritos(!showInscritos)}
            className="w-full flex items-center justify-between mb-4"
          >
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🎟️ Inscritos</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {registrations.filter((r: RegistrationWithName) => !r.is_waiting).length} inscritos
                {registrations.filter((r: RegistrationWithName) => r.is_waiting).length > 0 && (
                  <span className="text-amber-600 dark:text-amber-400 ml-1">
                    · {registrations.filter((r: RegistrationWithName) => r.is_waiting).length} na lista de espera
                  </span>
                )}
              </p>
            </div>
            <span className="text-gray-400 dark:text-gray-500 text-lg transition-transform duration-200" style={{ transform: showInscritos ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
          </button>
          {showInscritos && (
            <div className="px-4 pb-4 space-y-4">
              {(() => {
                const groups = new Map<string, RegistrationWithName[]>()
                for (const r of registrations) {
                  const key = `${r.category}-${r.group_name || "A"}`
                  if (!groups.has(key)) groups.set(key, [])
                  groups.get(key)!.push(r)
                }
                return [...groups.entries()].map(([key, regs]) => {
                  const [cat, grp] = key.split("-")
                  const sorted = [...regs].sort((a: RegistrationWithName, b: RegistrationWithName) => (a.registration_order || 999) - (b.registration_order || 999))
                  return (
                    <div key={key}>
                      <h4 className="text-sm font-bold text-gray-600 dark:text-gray-400 tracking-wider mb-2">
                        {getCategoryLabel(cat)} — Grupo {grp}
                      </h4>
                      <div className="space-y-1">
                        {sorted.map((r: RegistrationWithName, idx: number) => (
                          <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-gray-400 w-6 text-right">{idx + 1}</span>
                              <p className="font-medium text-gray-900 dark:text-white">{r.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {r.is_waiting && <Badge className="bg-amber-100 text-amber-800">Espera</Badge>}
                              {r.status === "approved" && r.payment_status === "paid" && <Badge className="bg-emerald-100 text-emerald-800">Pago</Badge>}
                              {r.status === "approved" && (!r.payment_status || r.payment_status === "pending") && <Badge className="bg-green-100 text-green-800">Confirmado</Badge>}
                              {r.status === "pending" && <Badge className="bg-gray-100 text-gray-600">Pendente</Badge>}
                              {r.status === "rejected" && <Badge className="bg-red-100 text-red-800">Recusado</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
