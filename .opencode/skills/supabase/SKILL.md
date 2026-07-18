---
name: supabase
description: "Use when creating SQL migrations, managing RLS policies, running Supabase CLI commands, or working with database tables, columns, and schemas in THE SUPER 8."
---

# Supabase — THE SUPER 8

## CLI Commands
| Comando | Descrição |
|---------|-----------|
| `npx supabase migration list --linked` | Ver estado local vs remoto |
| `npx supabase db push --linked` | Aplicar migrations pendentes |
| `npx supabase migration repair --status applied <id>` | Marcar como aplicada |
| `npx supabase migration repair --status reverted <id>` | Reverter status |
| `npx supabase db query --linked "SQL"` | Executar SQL direto no remoto |
| `npx supabase db dump --linked` | Ver schema remoto (precisa Docker) |

## Projeto
- **Project ref**: `ylltshboiejlcbhksrci`
- **URL**: `https://ylltshboiejlcbhksrci.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/ylltshboiejlcbhksrci

## DDL via CLI
A REST API (`@supabase/supabase-js`) NÃO suporta DDL. Sempre usar CLI:
```bash
npx supabase db query --linked "ALTER TABLE tabela ADD COLUMN IF NOT EXISTS coluna TIPO DEFAULT valor;"
```

## Safe ALTER TABLE (Idempotente)
```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'tabela' AND column_name = 'coluna'
  ) THEN
    ALTER TABLE tabela ADD COLUMN coluna tipo;
  END IF;
END $$;
```

## Criar Migration
1. Copiar `.sql` para `supabase/migrations/YYYYMMDDHHMM_descricao.sql`
2. Se houver migrations remotas sem arquivo local, criar placeholder vazio
3. Rodar `npx supabase db push --linked`
4. Se erro de history mismatch, usar `migration list` + `migration repair`

## Estrutura do Banco
Este projeto usa **16 tabelas** no schema `public` com TEXT PRIMARY KEY (IDs textuais tipo `"admin-001"`):
- `users` — auth custom (bcrypt) + Google OAuth
- `tournaments` — eventos com categorias, status, config
- `athlete_registrations` — inscrições com status/pagamento/fila
- `pairings` — chaveamento Whist (7 rodadas)
- `matches` — partidas com scores e status
- `tournament_results` — resultado final por atleta/torneio
- `annual_rankings` — ranking anual acumulado
- `sponsorships` — patrocínios por torneio (gold/silver/bronze)
- `expenses` — despesas do financeiro
- `revenues` — receitas do financeiro
- `photos` — fotos do evento
- `notifications` — notificações push
- `apoiadores` — apoiadores com brindes
- `brindes` — brindes associados a apoiadores
- `raffle_records` — histórico de sorteios
- `notes` — anotações do admin
- `config` — config global (PIX, WhatsApp)

## RLS (Row Level Security)
- Migration atual: `20260705010000_enable_rls.sql` — habilita RLS em todas as tabelas
- **Leitura pública**: qualquer um pode SELECT (anon key)
- **Escrita**: apenas autenticados (service_role) podem INSERT/UPDATE/DELETE
- Storage: bucket `photos` com `allow_public_upload` para upload direto via signed URL

## Dados Sensíveis
- `users.password` — bcrypt hash (10 rounds). NUNCA retornado no GET.
- `users.email`, `users.phone`, `users.avatar` — ocultos para não-admin via role filter em GET /api/data
