import { z } from "zod"

const idField = z.string().min(1)
const dateField = z.string()

const userSchema = z.object({
  id: idField,
  email: z.string(),
  name: z.string(),
  role: z.string(),
  password: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  url: z.string().optional(),
  created_at: dateField,
}).passthrough()

const tournamentSchema = z.object({
  id: idField,
  title: z.string(),
  edition: z.string(),
  date: dateField,
  location: z.string().optional(),
  status: z.string(),
  categories: z.array(z.string()),
  registration_fee: z.number().optional(),
  max_score: z.number().optional(),
  court_names: z.array(z.string()).optional(),
  created_at: dateField,
  created_by: z.string(),
}).passthrough()

const athleteRegistrationSchema = z.object({
  id: idField,
  tournament_id: z.string(),
  athlete_id: z.string(),
  status: z.string(),
  payment_status: z.string().optional(),
  registration_order: z.number().optional(),
  is_waiting: z.boolean().optional(),
  draw_number: z.number().optional(),
  category: z.string().optional(),
  group_name: z.string().optional(),
  confirmed: z.boolean().optional(),
  confirmed_at: z.string().optional(),
  created_at: dateField,
}).passthrough()

const pairingSchema = z.object({
  id: idField,
  tournament_id: z.string(),
  category: z.string(),
  group_name: z.string(),
  round: z.number(),
  court: z.string(),
  player1_id: z.string(),
  player2_id: z.string(),
  player3_id: z.string(),
  player4_id: z.string(),
}).passthrough()

const matchSchema = z.object({
  id: idField,
  pairing_id: z.string(),
  tournament_id: z.string(),
  category: z.string(),
  group_name: z.string(),
  round: z.number(),
  court: z.string(),
  team1_player1_id: z.string(),
  team1_player2_id: z.string(),
  team2_player1_id: z.string(),
  team2_player2_id: z.string(),
  score_team1: z.number(),
  score_team2: z.number(),
  status: z.string(),
  created_at: dateField,
}).passthrough()

const tournamentResultSchema = z.object({
  id: idField,
  tournament_id: z.string(),
  category: z.string(),
  group_name: z.string(),
  athlete_id: z.string(),
  round_scores: z.array(z.number()),
  total_games: z.number(),
  position: z.number(),
  points: z.number(),
}).passthrough()

const annualRankingSchema = z.object({
  id: idField,
  athlete_id: z.string(),
  category: z.string(),
  year: z.number(),
  total_points: z.number(),
  total_games: z.number(),
  tournaments_count: z.number(),
  wins_count: z.number(),
}).passthrough()

const sponsorshipSchema = z.object({
  id: idField,
  tournament_id: z.string(),
  sponsor_id: z.string(),
  tier: z.string(),
  amount: z.number(),
  description: z.string(),
  created_at: dateField,
}).passthrough()

const expenseSchema = z.object({
  id: idField,
  tournament_id: z.string(),
  category: z.string(),
  description: z.string(),
  amount: z.number(),
  receipt_url: z.string().optional(),
  date: dateField,
  created_by: z.string(),
  created_at: dateField,
}).passthrough()

const revenueSchema = z.object({
  id: idField,
  tournament_id: z.string(),
  source: z.string(),
  amount: z.number(),
  description: z.string(),
  date: dateField,
  created_by: z.string(),
  created_at: dateField,
}).passthrough()

const photoSchema = z.object({
  id: idField,
  tournament_id: z.string().optional(),
  url: z.string(),
  caption: z.string().optional(),
  uploaded_by: z.string(),
  created_at: dateField,
}).passthrough()

const notificationSchema = z.object({
  id: idField,
  user_id: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  read: z.boolean(),
  created_at: dateField,
}).passthrough()

const apoiadorSchema = z.object({
  id: idField,
  tournament_id: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  created_at: dateField,
}).passthrough()

const brindeSchema = z.object({
  id: idField,
  tournament_id: z.string(),
  apoiador_id: z.string(),
  description: z.string(),
  quantity: z.number(),
  type: z.string(),
  created_at: dateField,
}).passthrough()

const raffleRecordSchema = z.object({
  id: idField,
  tournament_id: z.string(),
  brinde_description: z.string(),
  winner_id: z.string(),
  winner_name: z.string(),
  created_at: dateField,
}).passthrough()

const noteSchema = z.object({
  id: idField,
  tournament_id: z.string().optional(),
  title: z.string(),
  content: z.string(),
  pinned: z.boolean(),
  created_at: dateField,
  updated_at: dateField,
}).passthrough()

export const appDataSchema = z.object({
  seed_version: z.number(),
  config: z.object({
    pix_key: z.string(),
    pix_name: z.string(),
    pix_city: z.string(),
    admin_whatsapp: z.string(),
  }).passthrough(),
  users: z.array(userSchema),
  tournaments: z.array(tournamentSchema),
  athlete_registrations: z.array(athleteRegistrationSchema),
  pairings: z.array(pairingSchema),
  matches: z.array(matchSchema),
  tournament_results: z.array(tournamentResultSchema),
  annual_rankings: z.array(annualRankingSchema),
  sponsorships: z.array(sponsorshipSchema),
  expenses: z.array(expenseSchema),
  revenues: z.array(revenueSchema),
  photos: z.array(photoSchema),
  notifications: z.array(notificationSchema),
  apoiadores: z.array(apoiadorSchema),
  brindes: z.array(brindeSchema),
  raffle_records: z.array(raffleRecordSchema),
  notes: z.array(noteSchema),
}).passthrough()
