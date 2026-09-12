-- Auditoria: exibir desempate no ranking. Persiste o saldo (scored-conceded)
-- calculado em calculateTournamentResults + backfill das linhas existentes.

ALTER TABLE public.tournament_results ADD COLUMN IF NOT EXISTS saldo INTEGER;

WITH s AS (
  SELECT tournament_id, category, group_name, team1_player1_id AS a, score_team1 AS scored, score_team2 AS conceded FROM public.matches WHERE status = 'finished'
  UNION ALL
  SELECT tournament_id, category, group_name, team1_player2_id, score_team1, score_team2 FROM public.matches WHERE status = 'finished'
  UNION ALL
  SELECT tournament_id, category, group_name, team2_player1_id, score_team2, score_team1 FROM public.matches WHERE status = 'finished'
  UNION ALL
  SELECT tournament_id, category, group_name, team2_player2_id, score_team2, score_team1 FROM public.matches WHERE status = 'finished'
),
agg AS (
  SELECT tournament_id, category, COALESCE(group_name, 'A') AS grp, a AS athlete_id,
    SUM(scored) - SUM(conceded) AS saldo
  FROM s GROUP BY 1, 2, 3, 4
)
UPDATE public.tournament_results r
SET saldo = agg.saldo
FROM agg
WHERE agg.tournament_id = r.tournament_id
  AND agg.category = r.category
  AND agg.grp = COALESCE(r.group_name, 'A')
  AND agg.athlete_id = r.athlete_id;
