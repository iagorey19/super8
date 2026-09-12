-- Auditoria 12/09/2026 (P2): remove índices duplicados (mantém o padrão *_id da
-- migration 20260721) e cobre FKs sem índice apontadas pelo database linter.

DROP INDEX IF EXISTS public.idx_athlete_registrations_tournament;
DROP INDEX IF EXISTS public.idx_athlete_registrations_athlete;
DROP INDEX IF EXISTS public.idx_athlete_registrations_unique;
DROP INDEX IF EXISTS public.idx_matches_tournament;
DROP INDEX IF EXISTS public.idx_notes_tournament;
DROP INDEX IF EXISTS public.idx_notifications_user;
DROP INDEX IF EXISTS public.idx_sponsorships_tournament;
DROP INDEX IF EXISTS public.idx_tournament_results_tournament;
-- users tem DUAS constraints UNIQUE em email (users_email_key + users_email_unique);
-- remove uma, a unicidade continua garantida pela outra.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_unique;

CREATE INDEX IF NOT EXISTS idx_brindes_apoiador_id ON public.brindes(apoiador_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON public.expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_matches_pairing_id ON public.matches(pairing_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON public.photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_raffle_records_tournament_id ON public.raffle_records(tournament_id);
CREATE INDEX IF NOT EXISTS idx_raffle_records_winner_id ON public.raffle_records(winner_id);
CREATE INDEX IF NOT EXISTS idx_revenues_created_by ON public.revenues(created_by);
CREATE INDEX IF NOT EXISTS idx_sponsorships_sponsor_id ON public.sponsorships(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_created_by ON public.tournaments(created_by);
