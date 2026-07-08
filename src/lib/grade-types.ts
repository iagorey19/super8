export interface GridCell {
  round: number
  court: string
  courtLabel: string
  team1: [string, string]
  team2: [string, string]
}

export interface GradeData {
  rounds: number[]
  gridCells: GridCell[]
  uniqueCourts: string[]
}
