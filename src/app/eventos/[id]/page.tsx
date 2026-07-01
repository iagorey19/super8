"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import * as store from "@/lib/store"
import { getStatusColor, getStatusLabel, getCategoryLabel } from "@/lib/utils"
import { generatePixPayload, generatePixQR, formatCurrency, generateWhatsAppLink } from "@/lib/pix"
import type { Tournament, RaffleRecord, AthleteRegistration } from "@/lib/types"

export default function EventoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [raffleRecords, setRaffleRecords] = useState<RaffleRecord[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [sponsors, setSponsors] = useState<any[]>([])
  const [apoiadores, setApoiadores] = useState<any[]>([])
  const [session, setSession] = useState<{ user: any } | null>(null)
  const [myReg, setMyReg] = useState<AthleteRegistration | null>(null)
  const [step, setStep] = useState<"idle" | "category" | "pix" | "done">("idle")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [pixPayload, setPixPayload] = useState("")
  const [pixQR, setPixQR] = useState("")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sendingPayment, setSendingPayment] = useState(false)

  const loadData = useCallback(async () => {
    try { await store.refreshFromServer() } catch {}
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
    if (!reg) return
    setMyReg(reg)
    if (tournament?.registration_fee) {
      await generatePixForRegistration(reg, athleteName)
    }
  }

  async function generatePixForRegistration(reg: AthleteRegistration, athleteName: string) {
    const config = store.getConfig()
    if (!config.pix_key || !tournament?.registration_fee) return
    const payload = generatePixPayload( config.pix_key, tournament.registration_fee, config.pix_name || "Pagamento", config.pix_city || "Cidade")
    setPixPayload(payload)
    console.log("[PIX] payload:", payload)
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
    await store.updateRegistrationPayment(myReg.id, "paid")
    setMyReg({ ...myReg, payment_status: "paid" })
    const config = store.getConfig()
    const tournamentTitle = tournament?.title || "Torneio"
    const msg = `Olá! Acabei de pagar a inscrição do ${tournamentTitle}! ✅\n\n👤 ${sess.user.name}\n📧 ${sess.user.email}\n📱 ${sess.user.phone || ""}\n💰 ${formatCurrency(tournament?.registration_fee || 0)}\n📋 ID: ${myReg.id}`
    const link = generateWhatsAppLink(config.admin_whatsapp, msg)
    window.open(link, "_blank", "noopener")
    setStep("done")
    setSendingPayment(false)
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
        <Badge className={getStatusColor(tournament.status)}>
          {getStatusLabel(tournament.status)}
        </Badge>
        {tournament.categories?.map((cat) => (
          <Badge key={cat} className="bg-purple-100 text-purple-800">
            {getCategoryLabel(cat)}
          </Badge>
        ))}
      </div>

      {tournament.date && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Data: {tournament.date}
        </p>
      )}

      {tournament.status === "registering" && step === "idle" && !myReg && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <div className="p-6 text-center space-y-4">
            <p className="text-lg font-bold text-amber-800 dark:text-amber-200">
              Quer jogar? 🎾
            </p>
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
            <Button onClick={handleStartRegistration} size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-bold" disabled={loading}>
              {loading ? "Entrando..." : "Inscrever-se"}
            </Button>
          </div>
        </Card>
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
            {tournament.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                disabled={loading}
                className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-2 border-amber-300 dark:border-amber-700 hover:shadow-md transition-all font-bold text-lg text-amber-800 dark:text-amber-200 disabled:opacity-50"
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
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

      {registrations.length > 0 && (
        <Card>
          <CardHeader title="🎟️ Inscritos" subtitle={`${registrations.filter((r: any) => !r.is_waiting).length} inscritos · ${registrations.filter((r: any) => r.is_waiting).length} na lista de espera`} />
          <div className="space-y-1">
            {[...registrations]
              .sort((a: any, b: any) => (a.registration_order || 999) - (b.registration_order || 999))
              .map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-6 text-right">{r.registration_order ?? "-"}</span>
                    <p className="font-medium text-gray-900 dark:text-white">{r.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.is_waiting && <Badge className="bg-amber-100 text-amber-800">Espera</Badge>}
                    {r.status === "approved" && r.payment_status === "paid" && <Badge className="bg-emerald-100 text-emerald-800">Confirmado</Badge>}
                    {r.status === "approved" && (!r.payment_status || r.payment_status === "pending") && <Badge className="bg-green-100 text-green-800">Aprovado</Badge>}
                    {r.status === "pending" && r.payment_status === "paid" && <Badge className="bg-blue-100 text-blue-800">Pago</Badge>}
                    {r.status === "pending" && (!r.payment_status || r.payment_status === "pending") && <Badge className="bg-gray-100 text-gray-600">Pendente</Badge>}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

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
                  {sponsors.map((s: any) => (
                    <div key={s.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-2 border-amber-300 dark:border-amber-700 rounded-xl px-5 py-4 shadow-sm flex items-center gap-3 min-w-[200px]">
                      <span className="text-2xl">{s.tier === "gold" ? "🥇" : s.tier === "silver" ? "🥈" : "🥉"}</span>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-base">{s.sponsor_name}</p>
                        {s.sponsor_url && (
                          <a href={s.sponsor_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 hover:text-amber-700 mt-0.5">
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
                  {apoiadores.map((a: any) => (
                    <div key={a.id} className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2 text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">{a.name}</span>
                      {a.brindes?.length > 0 && (
                        <span className="text-gray-600 dark:text-gray-300 ml-1">
                          - {a.brindes.map((b: any) => `${b.description} (${b.type === "kit" ? "Kit" : "Sorteio"})`).join(", ")}
                        </span>
                      )}
                    </div>
                  ))}
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
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{r.winner_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.brinde_description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
