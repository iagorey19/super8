---
name: deploy
description: "Use when deploying to Vercel, running builds, managing git workflow, or handling deployment issues in THE SUPER 8."
---

# Deploy — THE SUPER 8

## Workflow Padrão

```bash
# 1. Verificar TypeScript
npx tsc --noEmit

# 2. Build local
npm run build

# 3. Commitar e fazer push (auto-deploy Vercel)
git add .
git commit -m "descrição clara"
git push origin master
```

## Auto-Deploy
- Push no branch `master` → Vercel detecta → build + deploy (~1-2 min)
- Status: https://vercel.com/iagorey19s-projects/super8
- URL: https://super8-three.vercel.app

## Build Local
```bash
npm run build
```
Build padrão Next.js 16. Verificar logs para erros.

## Vercel.json
- SPA rewrites: `/(.*)` → `/`
- Cache: no-cache (root), immutable 1 ano (assets under `/_next/static`)
- Install: `npm install`

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Build falha no Vercel | Rodar `npm run build` local; verificar logs Vercel |
| TypeScript error | `npx tsc --noEmit` para achar erros |
| Deploy não atualiza | Verificar se push foi para `master`; esperar 1-2 min; hard refresh (Ctrl+Shift+R) |
| Tela branca | Abrir console do navegador (F12); verificar erros de rede |
| Dados não persistem | Verificar service_role key no .env.local e Vercel Env Vars |
| Cookie login não funciona | Verificar `AUTH_TOKEN_SECRET` no Vercel; cookie httpOnly depende de HTTPS |

## Processos Zumbis
Se Vite/Next.js local travar:
```powershell
Get-Process node | Where-Object { $_.Id -ne $PID } | Stop-Process -Force
```

## Variáveis de Ambiente (Vercel)
| Variável | Onde configurar |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel Dashboard > Project > Environment Variables |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel Dashboard > Project > Environment Variables |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel Dashboard > Project > Environment Variables (Sensitive) |
| `AUTH_TOKEN_SECRET` | Vercel Dashboard > Project > Environment Variables (Sensitive) |
