import { renderGradeCanvas, canvasToBlob } from "./grade-canvas"
import { generateText, generateCSV } from "./grade-builder"
import type { GridCell } from "./grade-types"
import jsPDF from "jspdf"

export async function copyGradeText(
  gridCells: GridCell[],
  uniqueCourts: string[],
  rounds: number[],
  categoryLabel: string,
  groupName: string
): Promise<boolean> {
  const text = generateText(gridCells, uniqueCourts, rounds, categoryLabel, groupName)
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    prompt("Copie o texto abaixo:", text)
    return false
  }
}

export async function exportGradePNG(
  gridCells: GridCell[],
  uniqueCourts: string[],
  rounds: number[],
  category: string,
  groupName: string,
  cellForFn: (court: string, round: number) => GridCell | undefined
) {
  const canvas = renderGradeCanvas(gridCells, uniqueCourts, rounds, cellForFn)
  const blob = await canvasToBlob(canvas)
  const link = document.createElement("a")
  link.download = `grade-${category}-grupo-${groupName}.png`
  link.href = URL.createObjectURL(blob)
  link.click()
  URL.revokeObjectURL(link.href)
}

export function exportGradeCSV(
  gridCells: GridCell[],
  uniqueCourts: string[],
  rounds: number[],
  category: string,
  groupName: string
) {
  const blob = new Blob(["\uFEFF" + generateCSV(gridCells, uniqueCourts, rounds)], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `grade-${category}-grupo-${groupName}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

export async function exportGradePDF(
  gridCells: GridCell[],
  uniqueCourts: string[],
  rounds: number[],
  category: string,
  groupName: string,
  cellForFn: (court: string, round: number) => GridCell | undefined
) {
  const canvas = renderGradeCanvas(gridCells, uniqueCourts, rounds, cellForFn)
  const dataUrl = canvas.toDataURL("image/png")
  const pdf = new jsPDF("l", "mm", "a4")
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height / 3 * pdfWidth) / (canvas.width / 3)
  pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight)
  pdf.save(`grade-${category}-grupo-${groupName}.pdf`)
}

export function exportGradeTXT(
  gridCells: GridCell[],
  uniqueCourts: string[],
  rounds: number[],
  categoryLabel: string,
  groupName: string,
  category: string
) {
  const text = generateText(gridCells, uniqueCourts, rounds, categoryLabel, groupName)
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `grade-${category}-grupo-${groupName}.txt`
  link.click()
  URL.revokeObjectURL(link.href)
}
