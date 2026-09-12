# 05 — Supabase (banco, migrations, seed, RLS)

Projeto: `ylltshboiejlcbhksrci` (THE SUPER 8, PRODUCTION). Schema completo em `docs/DATABASE.md`.

## CLI (sempre `--linked`)
```bash
supabase migration list --linked        # ver aplicadas vs locais
supabase db push --linked               # aplicar migrations
supabase db dump --linked > debug/dumps/backup-YYYYMMDD.sql   # backup antes de reset
npx supabase db query --linked "SELECT ..." --output json     # leitura/DDL remoto
```
A REST API **não** faz DDL — usar `db query --linked` com `... IF NOT EXISTS ...`.
Nunca assumir que `IF NOT EXISTS` cobre colunas: usar safety
`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns ...) THEN ALTER TABLE ... ADD COLUMN ...; END IF; END $$;`.
Mismatch local/remoto: `migration list` → `migration repair --status applied <id>`.

## Migrations
Criar em `supabase/migrations/YYYYMMDDHHMM_desc.sql` → `db push --linked` → conferir com `migration list`.
Backup obrigatório antes de migration destrutiva.

## Seed = snapshot (REGRA DE OURO — bug-001)
- O seed reflete o banco **no momento da escrita**. Dado inserido via app e não replicado no seed **será perdido no reset** (foi assim que 28 matches do T3 sumiram).
- Após CADA torneio completo: inserir pairings + matches + results no `src/lib/seed.ts`.
- Antes de qualquer reset: dump full + conferir que o seed cobre todos os dados atuais.
- Detalhes: `20-licoes-aprendidas/bug-001-seed-snapshot/`.

## Persistência
`upsert` com `onConflict: "id"`, `ignoreDuplicates: false`. Colunas NOT NULL exigem payload completo.
POST valida versão/estrutura via Zod (`src/lib/validation.ts`) antes de persistir.

## RLS e roles
RLS habilitada em **todas** as tabelas (`USING` + `WITH CHECK`). Nunca `USING true` em produção.
`GET /api/data` filtra por role: não-admin não vê `email/phone/avatar` de outros usuários.
Single-tenant hoje; se multi-liga no futuro, filtrar tudo por `tenant_id` + safeguard contra confusão `user.id × tenant.id`.
Storage: bucket `photos` (20MB), upload direto browser via signed URL (`/api/upload`), validar jpg/png/webp.

## Torneio — ciclo de vida
`upcoming → registering → ongoing → completed` (nunca pular estado; validar antes de cada ação:
`ongoing` bloqueia inscrições, `completed` bloqueia edições).
Capacidade 8/categoria; além disso `is_waiting: true` + `registration_order` (lista de espera com promoção + notificação).
Notificações: tipos `jogo/resultado/ranking/sorteio/geral`, sem spam.
