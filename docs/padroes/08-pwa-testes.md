# 08 — PWA, Cache e Testes

## Service worker
Padrão self-destructing: no `activate`, limpa `caches` + `unregister` (cache fica com o CDN da Vercel).
**Nunca acoplar `clients.claim()` com cleanup** — causa a barra de status piscando (bug já corrigido em `public/sw.js`).
Banner de instalação: não mostrar se `standalone`/dispensado (`localStorage`); iOS com instrução manual.

## Cache busting mobile
`scripts/generate-version.js` (via `prebuild`) gera `public/version.json` a cada build.
`<VersionCheck />` (no `layout.tsx`) compara a cada 60s (pausa com aba oculta) e recarrega se mudou.

## Polling (não reverter sem motivo)
Público (eventos/ranking/jogos): **30s**. Placar admin ao vivo: **10s**. Estáticos: 60s+.
Mobile nunca <3s. Parar com `visibilitychange` + `AbortController` onde aplicável.

## Testes
Pirâmide: unit (funções puras: `formatCurrency/formatDate`, pontos Whist, `chaveamento`) →
integração (hooks/componentes críticos) → E2E (login, inscrição, placar, ranking).
Segurança: `git ls-files .env` vazio · `.env.local` gitignorado · sem key no console ·
RLS ativo · anônimo não vaza `pix_key/passwords` · rate limit funcional.
Erros: offline/supabase fora → toast sem quebrar · 404 → `/` · crash de módulo → ErrorBoundary.

## Budgets (Next: acompanhar warnings do `next build`)
Chunk >600KB = BLOCKER (dynamic import / split). Nunca importar pesado
(`xlsx`, `jspdf`, `supabase`, libs de animação) direto na rota — `next/dynamic` + `Suspense`.
Exemplo já aplicado: `jspdf` com `await import` em `src/lib/grade-exports.ts`.

## Checklist pós-deploy
- [BLOCKER] `tsc` zero · `build` zero · home HTTP 200.
- [WARN] login/logout + CRUD + placar ok · console sem erros.
- [RECOMENDADO] rotas `/auth/login /eventos` ok · PWA instala (Android+iOS) · update sem hard refresh.
