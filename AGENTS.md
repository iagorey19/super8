<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — THE SUPER 8

## Contexto do Projeto
Stack: Next.js 16, Tailwind v4, Supabase (PostgreSQL), Vercel.
App de gestão de torneios de padel feminino no formato Whist (Americano).
Mobile-first, português brasileiro, confraternização > competição.
Supabase project: `ylltshboiejlcbhksrci` (THE SUPER 8, PRODUCTION)

## Links Rápidos
| Recurso | URL |
|---------|-----|
| **Site (Vercel)** | https://super8-three.vercel.app |
| **GitHub** | https://github.com/iagorey19/super8 |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/ylltshboiejlcbhksrci |
| **Vercel Dashboard** | https://vercel.com/iagorey19s-projects/super8 |

## Secrets & Credenciais
**NUNCA colocar valores reais aqui. Referenciar apenas onde encontrar.**

| Secret | Onde está definida |
|--------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel Env Vars (Production) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel Env Vars (Production) |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + Vercel Env Vars (Production, Sensitive) |
| `AUTH_TOKEN_SECRET` | `.env.local` + Vercel Env Vars (Production, Sensitive) |
| `GOOGLE_CLIENT_ID` | Google Cloud Console > APIs & Services > Credentials |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console > APIs & Services > Credentials |
| Database password | Supabase Dashboard > Project Settings > Database > Reset password |
| GitHub token | GitHub Settings > Developer settings > Personal access tokens |
| Vercel token | Vercel Dashboard > Settings > Tokens |

## Auto-Update
Ao alterar arquivos/testar, adicionar entrada no TOPO de Últimas Alterações (arquivo + resumo). Manter só últimas 5. Se conversa ~50 trocas, avisar: "⚠️ Conversa longa — sugiro `/salvar` e reiniciar."

## Últimas Alterações
- `components/ui/grade-preview.tsx` + `lib/grade-*.ts`: GradePreview modularizado em grade-types, grade-builder, grade-canvas, grade-exports; WHIST_SCHEDULE deduplicado (importa de chaveamento.ts)
- `eventos/[id]/jogos/page.tsx`: GradePreview integrado na visualização por categoria (com exportação PNG/PDF/CSV/TXT)
- `app/api/auth/session/route.ts`: `POST` agora seta cookie httpOnly (24h); novo `GET` valida cookie e retorna user; novo `DELETE` limpa cookie
- `app/auth/callback/route.ts`: Cookie httpOnly estendido de 300s para 24h
- `app/auth/handler/page.tsx`: Simplificado — não copia mais cookie para sessionStorage (cookie já persiste 24h)
- `lib/store.ts`: `getSession()` mantém sessionStorage como cache rápido; nova `fetchSessionFromCookie()` busca `GET /api/auth/session` como fallback; `logout()` agora é async e limpa cookie; `syncAuthUser()` usa `getSession()` em vez de sessionStorage direto
- `lib/auth-context.tsx`: No mount, tenta sessionStorage primeiro, depois fallback para cookie; logout é async
- `atleta/page.tsx`: Removeu escrita manual de sessionStorage (cookie + fetchSessionFromCookie substituem)

## Próximos Passos
1. **Auditoria de segurança completa** - Migrar rate limit para store compartilhado (Upstash Redis)

## Autenticação
- **Login**: `POST /api/auth/session` → busca user em `public.users`, `bcrypt.compare()`, retorna HMAC token + user + seta cookie httpOnly (24h)
- **Token**: HMAC-SHA256 com `AUTH_TOKEN_SECRET`, expira em 24h. Armazenado em cookie httpOnly + sessionStorage (cache)
- **Google OAuth**: `/auth/callback` → troca código por token Google → busca/cria user em `public.users` → seta cookie httpOnly (24h) → redirect para handler → página seguinte lê cookie via `GET /api/auth/session`
- **Password Reset**: `/auth/forgot-password` → `supabase.auth.resetPasswordForEmail()` → email com link → `/auth/reset-password` com OTP → atualiza Auth + `public.users`
- **Rate Limiting**: Login (5/min), POST data (30/min), admin-register (10/min), upload (30/min)
- `sessionStorage.getItem("super8-session")` → parse → `{ user, token }` (cache, cookie é canônico)

---
_Atualizado em: 07/07/2026_
