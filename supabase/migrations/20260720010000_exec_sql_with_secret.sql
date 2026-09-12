-- ⚠️ ATENÇÃO: secret original higienizado em 12/09/2026 (nunca commitar valor real).
-- O secret JÁ FOI aplicado ao banco e rotacionado depois. Valor real em .env.local + Vercel.
-- Substitui exec_sql por versão com parâmetro secret
-- Remove a versão antiga (sem proteção)
DROP FUNCTION IF EXISTS exec_sql(text);

-- Nova função: só executa se o secret conferir
CREATE OR REPLACE FUNCTION exec_sql(query text, secret text)
RETURNS void AS $$
BEGIN
  IF secret != '<EXEC_SQL_SECRET — valor historico removido>' THEN
    RAISE EXCEPTION 'Unauthorized: invalid exec_sql secret';
  END IF;
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
