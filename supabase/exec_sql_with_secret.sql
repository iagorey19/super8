-- HISTÓRICO (12/09/2026): função exec_sql REMOVIDA do banco (migration
-- 20260912010000_security_hardening.sql) — o secret vazava nos postgres logs a
-- cada DDL e nada no app usava a função. Este arquivo fica como registro.
-- NÃO recriar sem antes resolver o vazamento de secret nos logs.

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
