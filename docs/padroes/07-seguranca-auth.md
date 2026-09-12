# 07 — Segurança e Auth

## Auth custom (padrão do projeto)
- Login: `POST /api/auth/session` → busca em `public.users` → `bcrypt.compare()` → token HMAC-SHA256 (`AUTH_TOKEN_SECRET`, 24h) + cookie httpOnly.
- Cookie é canônico; `sessionStorage["super8-session"]` (`{ user, token }`) é cache. Logout limpa ambos.
- Comparação de assinatura com `crypto.timingSafeEqual` (nunca `===` em HMAC).
- Google OAuth: `/auth/callback` → troca code → busca/cria em `public.users` → cookie → handler lê via `GET /api/auth/session`.
- Password reset: `/auth/forgot-password` → `supabase.auth.resetPasswordForEmail()` → `/auth/reset-password` (OTP) → atualiza Auth + `public.users`. Senha mín. 6 chars (maiúscula + minúscula + número).
- **PROIBIDO em produção**: fallback auto-signup (criar conta se login falhar) e aliases hardcoded de email. Em dev, só via `.env.local` + flag.

## XSS
Sanitizar URLs geradas por usuário (`sanitizeUrl` em `src/lib/validate-url.ts`: só `http/https/mailto/tel`).
Nunca `dangerouslySetInnerHTML` com dados do usuário (exceção atual: script de tema no `layout.tsx`, estático e auditado).

## Open redirect
Todo param `next`/`redirect` (login, cadastro, OAuth callback) validado com `isSafeRedirect()`.

## Security headers (`src/proxy.ts`, convention Next.js 16)
`nosniff` · `DENY` · `XSS 1;mode=block` · `Referrer-Policy` · `Permissions-Policy` · `no-store` em páginas.

## Rate limit (in-memory; migrar p/ Upstash Redis se multi-instância)
Login 5/min · POST data 30/min · admin-register 10/min · upload 30/min · logs 60/min.
Pendente: migração para store compartilhado (ver Próximos Passos no `AGENTS.md`).

## Zod
Todo POST valida com `zod.safeParse` server-side (`src/lib/validation.ts`) antes do banco. RLS é a última linha de defesa, não a única.

## `EXEC_SQL_SECRET`
Protege `exec_sql(secret)` no banco. Só server-side, nunca commitar; se vazar: rotacionar no banco + Vercel + `.env.local` + redeploy.

## Checklist pré-deploy
- [BLOCKER] RLS em todas as tabelas · zero `any` + `tsc` ok · secrets só em env · sem `dangerouslySetInnerHTML` com dados de usuário · `build` ok.
- [WARN] URLs sanitizadas · Zod em todos os POSTs · backup antes de migration destrutiva.
- [RECOMENDADO] rate limit ativo · headers conferidos · checklist `debug/tests-manuais/checklist-seguranca.md`.
