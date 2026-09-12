# 02 — Anti-Breaking (8 mandamentos)

1. **`tsc` obrigatório** — `npx tsc --noEmit` zero erros antes de finalizar.
2. **Nunca hardcodar secrets** — `.env.local` (dev, gitignorado) + Vercel Env Vars (prod). `NEXT_PUBLIC_*` vai para o bundle: nunca service_role, AUTH_TOKEN_SECRET, EXEC_SQL_SECRET.
3. **Edições atômicas** — ler antes, âncora de 3-5 linhas, nunca assumir unicidade, evitar `replaceAll`.
4. **Mudou tipo → verificar todos os consumidores** (componentes, hooks, stores, seed).
5. **`build` obrigatório** — `npm run build` zero erros antes de commit/deploy.
6. **Store preserva compat** — param opcional nunca vira obrigatório; UI otimista com rollback.
7. **Seed atualizado** — mudou estrutura/dados de torneio completo → atualizar `src/lib/seed.ts`.
8. **Backup antes de reset** — `supabase db dump --linked > debug/dumps/backup-YYYYMMDD.sql`.

## Edição segura
Antes: ler arquivo completo + contexto + imports. Durante: contexto único, sem `replaceAll` cego.
Depois: `tsc` + `build` (BLOCKER), testar fluxo afetado, testar em produção se significativo.

## Erros que pegam neste projeto
- React 19: `e.currentTarget.value` (nunca `e.target.value`).
- Lucide: `CheckCircle2` / `MoreVertical` / `AlertCircle` (nunca `CircleCheck` / `EllipsisVertical` / `CircleAlert`).
- `key={item.id}` (nunca índice).
- Sem `:any` / `as any` — usar `unknown` + narrowing, `Record<string, unknown>`, ou `as unknown as TipoFinal`.
- Nunca `window.confirm` — usar diálogo de confirmação do design system.

## Checklist pré-finalização
- [BLOCKER] `npx tsc --noEmit` zero, `npm run build` zero, sem secrets no diff (`grep` por `sk-|gsk_|anon|service_role`).
- [WARN] consumidores de tipos verificados, compat da store mantida, seed atualizado, migrations aplicadas.
- [RECOMENDADO] Status Atual no `AGENTS.md`, skills atualizadas se arquitetura mudou.
