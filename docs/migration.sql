-- Supabase Migration: The Super 8
-- Paste this entire file into Supabase SQL Editor and run

-- Enable UUID extension (for gen_random_uuid() if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'athlete', 'sponsor')),
  phone TEXT,
  avatar TEXT,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tournaments
CREATE TABLE tournaments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  edition TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  categories JSONB NOT NULL DEFAULT '[]',
  registration_fee REAL,
  court_names JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL REFERENCES users(id)
);

-- Athlete Registrations
CREATE TABLE athlete_registrations (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  athlete_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  draw_number INT,
  category TEXT,
  group_name TEXT DEFAULT 'A',
  confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pairings
CREATE TABLE pairings (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  group_name TEXT NOT NULL,
  round INT NOT NULL,
  court TEXT NOT NULL,
  player1_id TEXT NOT NULL,
  player2_id TEXT NOT NULL,
  player3_id TEXT NOT NULL,
  player4_id TEXT NOT NULL
);

-- Matches
CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  pairing_id TEXT NOT NULL REFERENCES pairings(id) ON DELETE CASCADE,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  group_name TEXT NOT NULL,
  round INT NOT NULL,
  court TEXT NOT NULL,
  team1_player1_id TEXT NOT NULL,
  team1_player2_id TEXT NOT NULL,
  team2_player1_id TEXT NOT NULL,
  team2_player2_id TEXT NOT NULL,
  score_team1 INT NOT NULL DEFAULT 0,
  score_team2 INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'live', 'finished')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tournament Results
CREATE TABLE tournament_results (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  group_name TEXT NOT NULL,
  athlete_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  round_scores JSONB NOT NULL DEFAULT '[]',
  total_games INT NOT NULL DEFAULT 0,
  position INT NOT NULL,
  points INT NOT NULL
);

-- Annual Rankings
CREATE TABLE annual_rankings (
  id TEXT PRIMARY KEY,
  athlete_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  year INT NOT NULL,
  total_points INT NOT NULL DEFAULT 0,
  total_games INT NOT NULL DEFAULT 0,
  tournaments_count INT NOT NULL DEFAULT 0,
  wins_count INT NOT NULL DEFAULT 0
);

-- Sponsorships
CREATE TABLE sponsorships (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  sponsor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('gold', 'silver', 'bronze')),
  amount REAL NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Expenses
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('premiacao', 'estrutura', 'marketing', 'arbitragem', 'alimentacao', 'fotografia', 'brindes', 'outros')),
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  receipt_url TEXT,
  date TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Revenues
CREATE TABLE revenues (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('patrocinio', 'inscricao', 'outros')),
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Photos
CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('jogo', 'resultado', 'ranking', 'sorteio', 'geral')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Apoiadores
CREATE TABLE apoiadores (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Brindes
CREATE TABLE brindes (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  apoiador_id TEXT NOT NULL REFERENCES apoiadores(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  type TEXT NOT NULL CHECK (type IN ('kit', 'sorteio')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Raffle Records
CREATE TABLE raffle_records (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  brinde_description TEXT NOT NULL,
  winner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  winner_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notes
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  tournament_id TEXT REFERENCES tournaments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_date ON tournaments(date);
CREATE INDEX idx_athlete_registrations_tournament ON athlete_registrations(tournament_id);
CREATE INDEX idx_athlete_registrations_athlete ON athlete_registrations(athlete_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_tournament_results_tournament ON tournament_results(tournament_id);
CREATE INDEX idx_tournament_results_athlete ON tournament_results(athlete_id);
CREATE INDEX idx_annual_rankings_athlete ON annual_rankings(athlete_id);
CREATE INDEX idx_annual_rankings_category ON annual_rankings(category);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notes_tournament ON notes(tournament_id);
CREATE INDEX idx_sponsorships_tournament ON sponsorships(tournament_id);
CREATE INDEX idx_apoiadores_tournament ON apoiadores(tournament_id);
CREATE INDEX idx_brindes_tournament ON brindes(tournament_id);
