-- Auditoria 12/09/2026 (P1): upload direto anônimo no bucket photos permitia
-- burlar signed URL + rate-limit. Leitura pública mantida (eventos públicos).
-- Upload via app continua funcionando (usa service_role no signed URL).

DROP POLICY IF EXISTS allow_public_upload ON storage.objects;

CREATE POLICY allow_authenticated_upload
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'photos');
