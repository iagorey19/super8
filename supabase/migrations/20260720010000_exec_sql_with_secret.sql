-- ⚠️ ATENÇÃO: Esta migration contém o secret hardcoded (exposto no git).
-- O secret JÁ FOI aplicado ao banco. Após rotacionar, criar nova migration.
-- Substitui exec_sql por versão com parâmetro secret
-- Remove a versão antiga (sem proteção)
DROP FUNCTION IF EXISTS exec_sql(text);

-- Nova função: só executa se o secret conferir
CREATE OR REPLACE FUNCTION exec_sql(query text, secret text)
RETURNS void AS $$
BEGIN
  IF secret != '4970fe6b7dcb990386c868291c6b5cce7c2d80d26cad3853322719c51f0fc665' THEN
    RAISE EXCEPTION 'Unauthorized: invalid exec_sql secret';
  END IF;
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
