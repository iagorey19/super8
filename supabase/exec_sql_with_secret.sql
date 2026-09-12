-- Execute no SQL Editor do Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/ylltshboiejlcbhksrci/sql/new
-- ⚠️ NUNCA commite o valor real do secret. Gere um novo hash após qualquer exposição.
-- Gerar novo hash: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
-- Secret rotacionado em: 21/07/2026

-- Remove a versão antiga (sem proteção)
DROP FUNCTION IF EXISTS exec_sql(text);

-- Nova função: só executa se o secret conferir
CREATE OR REPLACE FUNCTION exec_sql(query text, secret text)
RETURNS void AS $$
BEGIN
  IF secret != '09bef7cb26db65ca82c3c0b83fae528251b4d88b6d6175880fa4a7d46327a621' THEN
    RAISE EXCEPTION 'Unauthorized: invalid exec_sql secret';
  END IF;
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
