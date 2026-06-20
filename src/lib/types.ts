export type Role = "admin" | "athlete" | "sponsor"

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: Role
  phone?: string
  avatar?: string
  url?: string
  created_at: string
}

export type AthleteStatus = "pending" | "approved" | "rejected"

export interface AthleteRegistration {
  id: string
  tournament_id: string
  athlete_id: string
  status: AthleteStatus
  draw_number?: number
  category?: string
  group_name?: string
  confirmed?: boolean
  confirmed_at?: string
  created_at: string
}

export type TournamentStatus = "upcoming" | "ongoing" | "completed"

export interface Tournament {
  id: string
  title: string
  edition: string
  date: string
  location?: string
  status: TournamentStatus
  categories: string[]
  registration_fee?: number
  max_score?: number
  court_names?: string[]
  created_at: string
  created_by: string
}

export interface Pairing {
  id: string
  tournament_id: string
  category: string
  group_name: string
  round: number
  court: string
  player1_id: string
  player2_id: string
  player3_id: string
  player4_id: string
}

export type MatchStatus = "pending" | "live" | "finished"

export interface Match {
  id: string
  pairing_id: string
  tournament_id: string
  category: string
  group_name: string
  round: number
  court: string
  team1_player1_id: string
  team1_player2_id: string
  team2_player1_id: string
  team2_player2_id: string
  score_team1: number
  score_team2: number
  status: MatchStatus
  created_at: string
}

export interface TournamentResult {
  id: string
  tournament_id: string
  category: string
  group_name: string
  athlete_id: string
  round_scores: number[]
  total_games: number
  position: number
  points: number
}

export interface AnnualRanking {
  id: string
  athlete_id: string
  category: string
  year: number
  total_points: number
  total_games: number
  tournaments_count: number
  wins_count: number
}

export type SponsorTier = "gold" | "silver" | "bronze"

export interface Sponsorship {
  id: string
  tournament_id: string
  sponsor_id: string
  tier: SponsorTier
  amount: number
  description: string
  created_at: string
}

export type ExpenseCategory = "premiacao" | "estrutura" | "marketing" | "arbitragem" | "alimentacao" | "fotografia" | "brindes" | "outros"

export interface Expense {
  id: string
  tournament_id: string
  category: ExpenseCategory
  description: string
  amount: number
  receipt_url?: string
  date: string
  created_by: string
  created_at: string
}

export type RevenueSource = "patrocinio" | "inscricao" | "outros"

export interface Revenue {
  id: string
  tournament_id: string
  source: RevenueSource
  amount: number
  description: string
  date: string
  created_by: string
  created_at: string
}

export interface Photo {
  id: string
  tournament_id?: string
  url: string
  caption?: string
  uploaded_by: string
  created_at: string
}

export type NotificationType = "jogo" | "resultado" | "ranking" | "sorteio" | "geral"

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  created_at: string
}

export interface Apoiador {
  id: string
  tournament_id: string
  name: string
  phone?: string
  created_at: string
}

export interface Brinde {
  id: string
  tournament_id: string
  apoiador_id: string
  description: string
  quantity: number
  type: "kit" | "sorteio"
  created_at: string
}

export interface RaffleRecord {
  id: string
  tournament_id: string
  brinde_description: string
  winner_id: string
  winner_name: string
  created_at: string
}

export interface Note {
  id: string
  tournament_id?: string
  title: string
  content: string
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface AppData {
  seed_version: number
  users: User[]
  tournaments: Tournament[]
  athlete_registrations: AthleteRegistration[]
  pairings: Pairing[]
  matches: Match[]
  tournament_results: TournamentResult[]
  annual_rankings: AnnualRanking[]
  sponsorships: Sponsorship[]
  expenses: Expense[]
  revenues: Revenue[]
  photos: Photo[]
  notifications: Notification[]
  apoiadores: Apoiador[]
  brindes: Brinde[]
  raffle_records: RaffleRecord[]
  notes: Note[]
}
