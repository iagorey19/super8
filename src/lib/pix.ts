import QRCode from "qrcode"

function crc16ccitt(data: string): string {
  let crc = 0xFFFF
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0")
}

function sanitizePixString(value: string, maxLen: number): string {
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const ascii = normalized.replace(/[^ -~]/g, "").trim()
  return ascii.slice(0, maxLen)
}

export function generatePixPayload(key: string, amount: number, name: string, city: string): string {
  const safeName = sanitizePixString(name, 25)
  const safeCity = sanitizePixString(city, 25)
  const safeKey = key.includes("@") || (key.length === 36 && key.includes("-"))
    ? key.trim()
    : key.replace(/\D/g, "")

  const gui = "br.gov.bcb.pix"
  const payloadFormat = "000201"
  const keyLen = String(safeKey.length).padStart(2, "0")
  const merchantAccountLen = String(8 + gui.length + safeKey.length).padStart(2, "0")
  const merchantAccount = `26${merchantAccountLen}0014${gui}01${keyLen}${safeKey}`
  const merchantCategory = "52040000"
  const currency = "5303986"
  const amountStr = amount.toFixed(2)
  const amountField = `54${String(amountStr.length).padStart(2, "0")}${amountStr}`
  const country = "5802BR"
  const nameLen = String(safeName.length).padStart(2, "0")
  const merchantName = `59${nameLen}${safeName}`
  const cityLen = String(safeCity.length).padStart(2, "0")
  const merchantCity = `60${cityLen}${safeCity}`
  const txid = "***"
  const txidField = `05${String(txid.length).padStart(2, "0")}${txid}`
  const additional = `62${String(txidField.length).padStart(2, "0")}${txidField}`
  const crc16 = "6304"
  const partial = `${payloadFormat}${merchantAccount}${merchantCategory}${currency}${amountField}${country}${merchantName}${merchantCity}${additional}${crc16}`
  return partial + crc16ccitt(partial)
}

export async function generatePixQR(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, { width: 400, margin: 4, errorCorrectionLevel: "H", color: { dark: "#000000", light: "#ffffff" } })
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
