# SETUP — THE SUPER 8

Sistema de gestão de torneios de padel no formato Whist (Americano).

## Pré-requisitos
- Node.js 18+ (`node --version`)
- Git (`git --version`)
- Supabase CLI (`npx supabase --version`) — para DDL no banco remoto

## Stack
- **Frontend**: Next.js 16 + Tailwind CSS v4 + TypeScript (App Router)
- **Banco**: Supabase (PostgreSQL) — via REST API (`@supabase/supabase-js`)
- **Deploy**: Vercel (Production)
- **Repositório**: GitHub

## Instalação
```bash
cd super8
npm install
cp .env.example .env.local  # preencher com credenciais
npm run dev
```
Acessar: `http://localhost:3000`

### Variáveis de Ambiente (`.env.local`)
| Variável | Onde obter |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Settings > API (`service_role` key) |
| `AUTH_TOKEN_SECRET` | Gerar com `openssl rand -base64 32` (qualquer string de 32+ chars) |
| `GOOGLE_CLIENT_ID` | Google Cloud Console > APIs & Services > Credentials |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console > APIs & Services > Credentials |

## Build de Produção
```bash
npm run build
```
Zero erros antes de qualquer commit/deploy.

## Deploy
```bash
npx vercel deploy --prod
```

## Dados
- **Persistência**: Supabase PostgreSQL (via `/api/data`)
- **Migração do JSON → Supabase**: `scripts/migrate-to-supabase.ts` (já executada)
- **Seed**: Automático via `/api/data` GET quando banco vazio (`count === 0`)
- **Sessão**: `sessionStorage` (chave `super8-session`) — auth custom com HMAC token

### Schema
- 16 tabelas com `TEXT PRIMARY KEY` (IDs textuais tipo `"ath-001"`, `"torneio-001"`)
- DDL completo em `docs/migration.sql`
- Para alterar schema: `npx supabase db query --linked "SQL"` (REST API não suporta DDL)

## Supabase CLI (DDL remoto)
```bash
npx supabase link --project-ref ylltshboiejlcbhksrci  # uma vez
npx supabase db query --linked "ALTER TABLE ..."        # DDL/DML remoto
```

## Google OAuth (produção)
1. Google Cloud Console > Credentials > Criar OAuth 2.0 Client ID (Web application)
2. Authorized redirect URIs: adicionar `https://super8-three.vercel.app/auth/callback`
3. Authorized JavaScript origins: adicionar `https://super8-three.vercel.app`
4. Copiar Client ID e Client Secret para Vercel Env Vars

## Troubleshooting
- **Erro de TypeScript**: `npm run build` e corrigir erros
- **Dados inconsistentes**: Deletar registros no Supabase Dashboard > Table Editor e recarregar página (seed recria)
- **Porta ocupada**: Next.js tenta próxima porta disponível
- **Login não funciona**: Verificar se `AUTH_TOKEN_SECRET` está configurada

## Login de Teste
Ver `AGENTS.md`.

---
_Atualizado em: 05/07/2026_
