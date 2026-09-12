-- Auditoria 12/09/2026 (P0/P1 segurança + sorteio manual).
-- 1. Remove exec_sql (sem uso no app; secret vazava nos postgres logs via DDL).
-- 2. Revoga EXECUTE das funções de diagnóstico de anon/authenticated (service_role continua).
-- 3. Trava search_path das funções de diagnóstico.
-- 4. winner_id anulável (sorteio manual registra só o nome).

DROP FUNCTION IF EXISTS public.exec_sql(text, text);
DROP FUNCTION IF EXISTS public.exec_sql(text);

REVOKE ALL ON FUNCTION public.check_all_pairings() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_all_matches() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_all_results() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.count_pairings() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.count_matches() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.count_t3_pairings() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.count_t3_matches() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.count_all_pairings() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.count_all_matches() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.list_pairings_tournaments() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

ALTER FUNCTION public.check_all_pairings() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_all_matches() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_all_results() SET search_path = public, pg_temp;
ALTER FUNCTION public.count_pairings() SET search_path = public, pg_temp;
ALTER FUNCTION public.count_matches() SET search_path = public, pg_temp;
ALTER FUNCTION public.count_t3_pairings() SET search_path = public, pg_temp;
ALTER FUNCTION public.count_t3_matches() SET search_path = public, pg_temp;
ALTER FUNCTION public.count_all_pairings() SET search_path = public, pg_temp;
ALTER FUNCTION public.count_all_matches() SET search_path = public, pg_temp;
ALTER FUNCTION public.list_pairings_tournaments() SET search_path = public, pg_temp;
ALTER FUNCTION public.rls_auto_enable() SET search_path = public, pg_temp;

ALTER TABLE public.raffle_records ALTER COLUMN winner_id DROP NOT NULL;
