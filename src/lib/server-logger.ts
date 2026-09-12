// Logger server (pino). Adaptacao do guia 26 para Next.js/Vercel:
// - dev: escreve em data/logs/app.log (pasta gitignorada)
// - producao (serverless, filesystem efemero): stdout em JSON (capturado pelos logs da Vercel)
import pino from "pino"

function createLogger() {
  if (process.env.NODE_ENV === "production") {
    return pino({ level: "info" })
  }
  try {
    return pino(
      { level: "debug" },
      pino.destination({ dest: "./data/logs/app.log", mkdir: true, sync: false })
    )
  } catch {
    return pino({ level: "debug" })
  }
}

export const serverLogger = createLogger()
