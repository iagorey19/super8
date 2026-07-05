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
- `store.ts`: `registerMultipleAthletes()` agora atribui `registration_order`, `is_waiting`, `payment_status` e notificações
- `store.ts`: Nova função `getCategoryAvailability()` — mostra vagas disponíveis por categoria
- `admin/torneios/[id]/page.tsx`: Modal de registro exige disponibilidade de vagas com status visual (verde/âmbar/vermelho)
- `eventos/[id]/page.tsx`: Auto-inscrição mostra vagas restantes; se todas lotadas bloqueia inscrição
- `lib/validation.ts`: Schema Zod valida `POST /api/data` — retorna 400 se payload malformado
- `api/data/route.ts`: GET filtra PII (email/phone/avatar) de outros usuários se role não-admin
- `db/index.ts`: `reloadFromServer()` envia token de sessão para GET
- `next.config.ts`: Security headers (`X-Content-Type-Options`, `X-Frame-Options`, etc.)
- `auth/callback/route.ts`: OAuth Google — cria usuário, seta cookie httpOnly, redirect seguro
- `auth/forgot-password/page.tsx` + `reset-password/page.tsx`: Fluxo completo de reset de senha
- `lib/validate-url.ts`, `lib/auth-secret.ts`, `lib/rate-limit.ts`: Módulos de segurança
- Várias páginas: Sanitização de URL contra XSS (patrocinadores, fotos)

## Próximos Passos
1. **Aprovar/Rejeitar da lista de espera** — admin poder mover atleta da espera para vaga quando alguém desiste
2. **Notificações no app do atleta** — exibir notificações de inscrição/pagamento no frontend do atleta
3. **Regra de desempate do ranking anual** — definir critério final
4. **Zod schemas mais granulares** — validar cada entidade individualmente (Tournament, Match, etc.)

## Autenticação
- **Login**: `POST /api/auth/session` → busca user em `public.users`, `bcrypt.compare()`, retorna HMAC token + user
- **Token**: HMAC-SHA256 com `AUTH_TOKEN_SECRET`, expira em 24h. Armazenado em `sessionStorage` (chave: `super8-session`)
- **Google OAuth**: `/auth/callback` → troca código por token Google → busca/cria user em `public.users` → seta cookie httpOnly → handler lê cookie via `GET /api/auth/token` → salva em sessionStorage
- **Password Reset**: `/auth/forgot-password` → `supabase.auth.resetPasswordForEmail()` → email com link → `/auth/reset-password` com OTP → atualiza Auth + `public.users`
- **Rate Limiting**: Login (5/min), POST data (30/min), admin-register (10/min), upload (30/min)
- `sessionStorage.getItem("super8-session")` → parse → `{ user, token }`

---
_Atualizado em: 05/07/2026_
