# 06 — Deploy, Env Vars e Scripts

## Fluxo
`git push` na main → Vercel auto-deploy (~1-2 min) → produção.
Commits semânticos (`feat|fix|chore|docs`). Main protegida; PR para mudanças grandes.
Manual: `vercel --prod`. Status: dashboard Vercel do projeto.

## Env vars
| Var | Onde | Sensível |
|-----|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel | Não (vão p/ bundle) |
| `SUPABASE_SERVICE_ROLE_KEY` / `AUTH_TOKEN_SECRET` / `EXEC_SQL_SECRET` | `.env.local` + Vercel | **Sim** |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud + Vercel | **Sim** |

Dev em `.env.local` (gitignorado). Rotação: Vercel Settings → Env Vars → Edit → Save → Redeploy → aguardar Ready.
Verificar com `.\debug\scripts\check-env.ps1` (mostra só nomes, nunca valores).

## CLI first, navegador last
`supabase db push --linked` · `vercel env ls/add` · `vercel --prod` · `gh pr create/merge`.
Navegador só para billing, logs visuais e ajustes pontuais.

## Fluxo banco + deploy
migration local → `supabase db push --linked` → (`vercel env add` se nova var) → `vercel --prod` ou push.

## Troubleshooting
- Build falha → logs Vercel + `npm run build` local + conferir envs.
- App não carrega → console + banco acessível + RLS bloqueando?
- Dados inconsistentes → Table Editor (seed recria o esperado).
- Login falha → `AUTH_TOKEN_SECRET` ausente no ambiente.
- Cache mobile (conteúdo velho) → `version.json` + `<VersionCheck />` (ver `08-pwa-testes.md`).

## Checklist pós-deploy
1. Home HTTP 200; 2. `/auth/login` + rotas principais; 3. login/logout + CRUD crítico;
4. console sem erros; 5. registrar no Status Atual (`AGENTS.md`).
Script: `.\debug\scripts\check-routes.ps1 [-BaseUrl ...]`.
