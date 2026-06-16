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
cp .env.example .env.local  # preencher com credenciais Supabase
npm run dev
```
Acessar: `http://localhost:3000`

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
- **Sessão**: `sessionStorage` (chave `super8-session`) — auth custom (não Supabase Auth)

### Schema
- 16 tabelas com `TEXT PRIMARY KEY` (IDs textuais tipo `"ath-001"`, `"torneio-001"`)
- DDL completo em `docs/migration.sql`
- Para alterar schema: `npx supabase db query --linked "SQL"` (REST API não suporta DDL)

## Supabase CLI (DDL remoto)
```bash
npx supabase link --project-ref ylltshboiejlcbhksrci  # uma vez
npx supabase db query --linked "ALTER TABLE ..."        # DDL/DML remoto
```

## Troubleshooting
- **Erro de TypeScript**: `npm run build` e corrigir erros
- **Dados inconsistentes**: Deletar registros no Supabase Dashboard > Table Editor e recarregar página (seed recria)
- **Porta ocupada**: Next.js tenta próxima porta disponível

## Login de Teste
Ver `AGENTS.md`.

---
_Atualizado em: 15/06/2026_
