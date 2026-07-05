import { z } from "zod"

const idField = z.string().min(1)

const entitySchema = z.object({ id: idField }).passthrough()

export const appDataSchema = z.object({
  seed_version: z.number(),
  config: z.object({
    pix_key: z.string(),
    pix_name: z.string(),
    pix_city: z.string(),
    admin_whatsapp: z.string(),
  }).passthrough(),
  users: z.array(z.object({
    id: idField,
    email: z.string(),
    name: z.string(),
    role: z.string(),
    password: z.string().optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
    url: z.string().optional(),
    created_at: z.string(),
  }).passthrough()),
  tournaments: z.array(entitySchema),
  athlete_registrations: z.array(entitySchema),
  pairings: z.array(entitySchema),
  matches: z.array(entitySchema),
  tournament_results: z.array(entitySchema),
  annual_rankings: z.array(entitySchema),
  sponsorships: z.array(entitySchema),
  expenses: z.array(entitySchema),
  revenues: z.array(entitySchema),
  photos: z.array(entitySchema),
  notifications: z.array(entitySchema),
  apoiadores: z.array(entitySchema),
  brindes: z.array(entitySchema),
  raffle_records: z.array(entitySchema),
  notes: z.array(entitySchema),
}).passthrough()
