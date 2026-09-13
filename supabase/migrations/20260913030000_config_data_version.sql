-- Poll inteligente: contador global incrementado a cada escrita.
-- Clientes consultam /api/data-version (bytes) e só baixam /api/data quando muda.

ALTER TABLE public.config ADD COLUMN IF NOT EXISTS data_version BIGINT NOT NULL DEFAULT 0;
