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

function formatPixKey(key: string): string {
  if (key.includes("@") || (key.length === 36 && key.includes("-"))) return key.trim()
  const digits = key.replace(/\D/g, "")
  return digits.length >= 10 ? `+55${digits}` : digits
}

export function generatePixPayload(key: string, amount: number, name: string, city: string): string {
  const safeName = sanitizePixString(name, 25)
  const safeKey = formatPixKey(key)
  const safeCity = sanitizePixString(city, 15)

  const gui = "br.gov.bcb.pix"
  const payloadFormat = "000201"
  const pointInit = "010211"
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
  const txid = "62070503***"
  const crc16 = "6304"
  const partial = `${payloadFormat}${pointInit}${merchantAccount}${merchantCategory}${currency}${amountField}${country}${merchantName}${merchantCity}${txid}${crc16}`
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
