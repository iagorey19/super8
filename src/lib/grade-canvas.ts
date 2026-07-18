import type { GridCell } from "./grade-types"

const COL_W = 220
const COL0_W = 140
const ROW_H = 36
const ROW_DATA_H = 82
const SCALE = 3

function drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) {
  ctx.fillStyle = fill
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = "#d1d5db"
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, w, h)
}

function drawText(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string, opts?: { bold?: boolean; color?: string; size?: number }) {
  const color = opts?.color || "#111827"
  const size = opts?.size || 13
  ctx.fillStyle = color
  ctx.font = `${opts?.bold ? "bold " : ""}${size}px 'Segoe UI', Arial, sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, x + w / 2, y + h / 2)
}

function textWidth(ctx: CanvasRenderingContext2D, text: string, size: number, bold: boolean) {
  ctx.font = `${bold ? "bold " : ""}${size}px 'Segoe UI', Arial, sans-serif`
  return ctx.measureText(text).width
}

function drawDataCell(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cell: GridCell) {
  const padX = 8
  const maxW = w - padX * 2
  const fontSize = 12
  const vsSize = 11
  const colorText = "#111827"
  const colorVs = "#9ca3af"

  const l1 = `${cell.team1[0]} / ${cell.team1[1]}`
  const l3 = `${cell.team2[0]} / ${cell.team2[1]}`

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(x, y, w, h)

  const w1 = textWidth(ctx, l1, fontSize, false)
  const w3 = textWidth(ctx, l3, fontSize, false)

  if (w1 <= maxW && w3 <= maxW) {
    const total = 3
    const lineH = h / total
    ctx.fillStyle = colorText
    ctx.font = `${fontSize}px 'Segoe UI', Arial, sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(l1, x + w / 2, y + lineH * 0 + lineH / 2)
    ctx.fillStyle = colorVs
    ctx.font = `${vsSize}px 'Segoe UI', Arial, sans-serif`
    ctx.fillText("vs", x + w / 2, y + lineH * 1 + lineH / 2)
    ctx.fillStyle = colorText
    ctx.font = `${fontSize}px 'Segoe UI', Arial, sans-serif`
    ctx.fillText(l3, x + w / 2, y + lineH * 2 + lineH / 2)
  } else {
    const total = 5
    const lineH = h / total
    ctx.font = `${fontSize}px 'Segoe UI', Arial, sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = colorText
    ctx.fillText(cell.team1[0], x + w / 2, y + lineH * 0 + lineH / 2)
    ctx.fillText(cell.team1[1], x + w / 2, y + lineH * 1 + lineH / 2)
    ctx.fillStyle = colorVs
    ctx.font = `${vsSize}px 'Segoe UI', Arial, sans-serif`
    ctx.fillText("vs", x + w / 2, y + lineH * 2 + lineH / 2)
    ctx.fillStyle = colorText
    ctx.font = `${fontSize}px 'Segoe UI', Arial, sans-serif`
    ctx.fillText(cell.team2[0], x + w / 2, y + lineH * 3 + lineH / 2)
    ctx.fillText(cell.team2[1], x + w / 2, y + lineH * 4 + lineH / 2)
  }
}

export function renderGradeCanvas(
  gridCells: GridCell[],
  uniqueCourts: string[],
  rounds: number[],
  cellForFn: (court: string, round: number) => GridCell | undefined
): HTMLCanvasElement {
  const cw = COL0_W + rounds.length * COL_W
  const ch = ROW_H + uniqueCourts.length * ROW_DATA_H

  const canvas = document.createElement("canvas")
  canvas.width = cw * SCALE
  canvas.height = ch * SCALE
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D context not available")
  ctx.scale(SCALE, SCALE)

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, cw, ch)

  const numCols = rounds.length + 1
  const numRows = uniqueCourts.length + 1

  const colW = (i: number) => (i === 0 ? COL0_W : COL_W)

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const cx = c === 0 ? 0 : COL0_W + (c - 1) * COL_W
      const cy = r === 0 ? 0 : ROW_H + (r - 1) * ROW_DATA_H
      const cw2 = colW(c)
      const ch2 = r === 0 ? ROW_H : ROW_DATA_H
      const fill = r === 0 ? "#f3f4f6" : "#ffffff"
      drawCell(ctx, cx, cy, cw2, ch2, fill)

      if (r === 0) {
        const text = c === 0 ? "Quadra" : `${rounds[c - 1]}ª Rodada`
        drawText(ctx, cx, cy, cw2, ch2, text, { bold: true, color: "#374151", size: 13 })
      } else if (c === 0) {
        drawText(ctx, cx, cy, cw2, ch2, cellForFn(uniqueCourts[r - 1], 1)?.courtLabel || `Quadra ${uniqueCourts[r - 1]}`, { bold: true, color: "#374151", size: 12 })
      } else {
        const cell = cellForFn(uniqueCourts[r - 1], rounds[c - 1])
        if (cell) {
          drawDataCell(ctx, cx, cy, cw2, ch2, cell)
        }
      }
    }
  }

  return canvas
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png")
  })
}
