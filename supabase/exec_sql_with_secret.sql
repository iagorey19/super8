-- Execute no SQL Editor do Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/ylltshboiejlcbhksrci/sql/new
-- ⚠️ NUNCA commite o valor real do secret (guia 21 — BLOCKER).
-- O valor real vive em: .env.local (gitignorado) + Vercel Env Vars (Sensitive).
-- Apos qualquer exposicao: gerar novo (`crypto.randomBytes(32).toString('hex')`),
-- aplicar via `supabase db query --linked --file <arquivo-temporario-fora-do-repo>.sql`,
-- atualizar .env.local + Vercel, redeploy, apagar o temporario.
-- Secret rotacionado em: 12/09/2026 (exposicao acidental no commit 7d4a4c3)

-- Remove a versão antiga (sem proteção)
DROP FUNCTION IF EXISTS exec_sql(text);

-- Nova função: só executa se o secret conferir
CREATE OR REPLACE FUNCTION exec_sql(query text, secret text)
RETURNS void AS $$
BEGIN
  IF secret != '<EXEC_SQL_SECRET — ver .env.local / Vercel Env Vars>' THEN
    RAISE EXCEPTION 'Unauthorized: invalid exec_sql secret';
  END IF;
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
