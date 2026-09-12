# 03 — Stack e Padrões de Código

## Stack
Next.js 16 (App Router, `"use client"`), Tailwind v4 (OKLCH, CSS-first), TypeScript strict,
Supabase PostgreSQL (16 tabelas, `TEXT PRIMARY KEY` legado), API `/api/data` (GET fetch+seed, POST persist),
store centralizada (`src/lib/store/`), auth custom + Google OAuth, Vercel auto-deploy, ESLint v9, Zod.

**IDs**: legado `TEXT` (`admin-001`, `torneio-001`) mantido por compatibilidade. Novo código: `crypto.randomUUID()`.

## Nomenclatura
Componentes PascalCase · hooks `useX` · stores `useXStore` · utils/funções camelCase ·
páginas App Router kebab-case · tipos PascalCase · consts UPPER_SNAKE ·
migrations `YYYYMMDDHHMM_desc.sql`.

## TypeScript strict
`strict + noUnusedLocals + noUnusedParameters + noImplicitAny`. Zero `any`.
Tipos centralizados em `src/lib/types.ts`. Ao mudar tipo → atualizar consumidores + `tsc`.

## React 19
- `onChange` com `e.currentTarget.value`; keys com IDs únicos.
- App Router: **não** usar `React.lazy` em rotas — `next/dynamic` só para modais pesados/charts.
- Server Components por padrão; `"use client"` só se necessário.
- Mutations → `toast.error("mensagem amigável pt-BR")`, nunca erro raw.
- Mobile-first: tabelas `overflow-x-auto + min-w-[650px]`; modais centralizados; ação principal visível sem scroll; touch ≥44px.

## Tailwind v4
Sem `tailwind.config.js` — config via CSS + `@theme`. **Nunca hardcodar cor** (`bg-emerald-500`, hex):
usar tokens (`bg-background text-foreground bg-primary bg-card border-border text-muted`).
`cn()` de `src/lib/utils.ts`. Dark mode: classe `dark` no `<html>`, variáveis `:root/.dark`.

## Store (centralizada em `src/lib/store/`)
Backend/CRUD → fetch via `/api/data` com persistência; filtros/modais/mês → estado local;
tenant/tema/preferências → persistido; token/user → auth context; input/busca → `useState`.
Nunca duplicar dado do backend em estado paralelo; selectors específicos (sem re-render total).

## Lucide Icons — travado em `lucide-react@0.400.0` (NÃO v1.x)
Mapeamento: `CheckCircle2`, `MoreVertical`, `AlertCircle`. Tamanhos: 16px inline/tabela,
20px ações/botões, 24px destaque, 48px empty state. Cor herda o texto (`text-primary`,
`text-muted-foreground`, `text-destructive`); nunca `text-black/white` direto.

## Animações
Interações simples → Tailwind (`transition-colors duration-200`, `animate-pulse` p/ loading).
Modais/listas/sidebar → Motion (quando instalado). Animar só `transform/opacity` (GPU);
nunca `width/height/top/left`. Respeitar `prefers-reduced-motion`.

## Datas e moeda
Banco: `YYYY-MM-DD` / ISO. UI: `DD/MM/YYYY` via `formatDate` (`src/lib/utils.ts`).
Moeda: `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })` (não duplicar — ver `src/lib/pix.ts`).

## Raiz limpa
Scripts → `debug/scripts/` · SQL → `supabase/migrations/` · imagens → `public/images/` ·
testes manuais → `debug/tests-manuais/` · logs/dumps → `debug/logs|dumps/` (gitignorados) ·
docs → `docs/`. Raiz só com config + docs principais.
