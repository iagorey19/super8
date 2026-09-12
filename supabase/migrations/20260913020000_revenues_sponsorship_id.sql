-- Auditoria: vincular receita de patrocínio ao sponsorship (fim das órfãs).
-- Backfill: casa pela combinação (torneio, valor, descrição) quando única.

ALTER TABLE public.revenues ADD COLUMN IF NOT EXISTS sponsorship_id TEXT;
CREATE INDEX IF NOT EXISTS idx_revenues_sponsorship_id ON public.revenues(sponsorship_id);

WITH ranked AS (
  SELECT r.id AS revenue_id, s.id AS sponsorship_id,
    ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY s.created_at) AS rn,
    COUNT(*) OVER (PARTITION BY r.tournament_id, r.amount, r.description) AS matches
  FROM public.revenues r
  JOIN public.sponsorships s
    ON s.tournament_id = r.tournament_id
    AND s.amount = r.amount
    AND (s.description = r.description
      OR r.description = 'Patrocínio ' || (SELECT name FROM public.users WHERE id = s.sponsor_id))
  WHERE r.source = 'patrocinio' AND r.sponsorship_id IS NULL
)
UPDATE public.revenues r
SET sponsorship_id = ranked.sponsorship_id
FROM ranked
WHERE ranked.revenue_id = r.id AND ranked.rn = 1 AND ranked.matches = 1;
