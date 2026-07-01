"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as store from "@/lib/store"
import type { AppConfig } from "@/lib/types"

export default function AdminConfigPage() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const c = store.getConfig()
    setConfig({ ...c })
  }, [])

  function handleChange(field: keyof AppConfig, value: string) {
    if (!config) return
    setConfig({ ...config, [field]: value })
  }

  async function handleSave() {
    if (!config) return
    setSaving(true)
    await store.updateConfig(config)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!config) return null

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>

      <Card>
        <CardHeader title="💳 PIX" />
        <div className="space-y-4">
          <Input
            label="Chave PIX"
            placeholder="47999104494"
            value={config.pix_key}
            onChange={(e) => handleChange("pix_key", e.currentTarget.value)}
          />
          <Input
            label="Nome do recebedor"
            placeholder="Guiomar"
            value={config.pix_name}
            onChange={(e) => handleChange("pix_name", e.currentTarget.value)}
          />
          <Input
            label="Cidade"
            placeholder="Balneario Camboriu"
            value={config.pix_city}
            onChange={(e) => handleChange("pix_city", e.currentTarget.value)}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="📱 WhatsApp" />
        <div className="space-y-4">
          <Input
            label="Número do administrador (55 + DDD + número)"
            placeholder="5547997436809"
            value={config.admin_whatsapp}
            onChange={(e) => handleChange("admin_whatsapp", e.currentTarget.value)}
          />
        </div>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Salvando..." : saved ? "✅ Salvo!" : "Salvar configurações"}
      </Button>
    </div>
  )
}
