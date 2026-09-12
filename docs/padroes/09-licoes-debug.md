# 09 — Lições, Debug e Limpeza

## Lições (fluxo BLOCKER)
1. ANTES de corrigir: `.\debug\scripts\consultar-licoes.ps1 -Termo "<assunto>"`.
2. AO corrigir: documentar Bug→Causa→Impacto→Solução→Prevenção em `20-licoes-aprendidas/bug-XXX/`.
3. Bugs desse projeto ficam no acervo **local** (`20-licoes-aprendidas/`), não em outro projeto.

## Debug
Estrutura em `debug/` (ver `debug/README.md`). Debug ao vivo já implementado:
logger client (`src/lib/logger.ts` + `<ErrorLogger />`) → `POST /api/logs` (rate limit 60/min)
→ `serverLogger` pino (`src/lib/server-logger.ts`; arquivo em dev, stdout em prod).
Diagnóstico: `GET /api/debug/all` (poll 30s; só booleans, nunca segredos).

## Limpeza proativa — quando limpar
Após refactor/remoção de feature: imports `TS6133`, funções sem callers, `console.log` de dev,
vars `noUnusedLocals/Params`, dead code comentado, branches mortos, arquivos órfãos, tabelas legadas (`DROP TABLE IF EXISTS`).
Toda sessão: processos `node.exe` órfãos (`.\scripts\LIMPAR_MCPs.bat` início/fim; `cleanup-opencode.ps1` p/ sessão diffs/logs).
Como: identificar → conferir consumidores/testes → remover gradual → `build` após cada remoção.

## CLI first
`supabase db push/query --linked` · `vercel env ls/add` · `vercel --prod` · `git/gh`.
Navegador só para billing, logs visuais e ajustes pontuais.
