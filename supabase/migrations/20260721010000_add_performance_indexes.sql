-- Migration: Add performance indexes for frequently queried columns
-- Date: 2026-07-21

-- Registrations: lookup by tournament and athlete
CREATE INDEX IF NOT EXISTS idx_athlete_registrations_tournament_id ON athlete_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_athlete_registrations_athlete_id ON athlete_registrations(athlete_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_athlete_registrations_unique ON athlete_registrations(tournament_id, athlete_id);

-- Pairings: lookup by tournament and category
CREATE INDEX IF NOT EXISTS idx_pairings_tournament_id ON pairings(tournament_id);
CREATE INDEX IF NOT EXISTS idx_pairings_category ON pairings(category);

-- Matches: lookup by tournament, status, and category
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_category ON matches(category);

-- Tournament results: lookup by tournament and category
CREATE INDEX IF NOT EXISTS idx_tournament_results_tournament_id ON tournament_results(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_results_category ON tournament_results(category);

-- Annual rankings: lookup by year and category
CREATE INDEX IF NOT EXISTS idx_annual_rankings_year ON annual_rankings(year);
CREATE INDEX IF NOT EXISTS idx_annual_rankings_category ON annual_rankings(category);

-- Sponsorships: lookup by tournament
CREATE INDEX IF NOT EXISTS idx_sponsorships_tournament_id ON sponsorships(tournament_id);

-- Expenses: lookup by tournament
CREATE INDEX IF NOT EXISTS idx_expenses_tournament_id ON expenses(tournament_id);

-- Revenues: lookup by tournament
CREATE INDEX IF NOT EXISTS idx_revenues_tournament_id ON revenues(tournament_id);

-- Photos: lookup by tournament
CREATE INDEX IF NOT EXISTS idx_photos_tournament_id ON photos(tournament_id);

-- Notifications: lookup by user
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Notes: lookup by tournament
CREATE INDEX IF NOT EXISTS idx_notes_tournament_id ON notes(tournament_id);
