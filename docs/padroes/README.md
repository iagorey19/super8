# Padrões do Projeto — THE SUPER 8

Regras adaptadas dos guias universais para esta stack (**Next.js 16 + Tailwind v4 + Supabase + Vercel**).
Estes arquivos são a **fonte canônica local** — consultar antes de implementar qualquer funcionalidade.

| Arquivo | Cobre |
|---------|-------|
| [01-comunicacao-autonomia.md](01-comunicacao-autonomia.md) | Interação com IA, plano+autorização, auto-update, MCPs/skills, gauntlet/BAR |
| [02-anti-breaking.md](02-anti-breaking.md) | 8 mandamentos, edição segura, checklist pré-finalização |
| [03-stack-codigo.md](03-stack-codigo.md) | Stack, nomenclatura, TypeScript strict, React 19, Tailwind v4, store, Lucide, animações |
| [04-design-system.md](04-design-system.md) | Tokens visuais (atalho para `DESIGN.md` na raiz) |
| [05-supabase.md](05-supabase.md) | CLI, migrations, DDL, seed snapshot, RLS, persistência |
| [06-deploy.md](06-deploy.md) | Vercel, env vars, GitHub, troubleshooting, scripts |
| [07-seguranca-auth.md](07-seguranca-auth.md) | Auth custom, OAuth, XSS, open redirect, headers, rate limit, Zod |
| [08-pwa-testes.md](08-pwa-testes.md) | Service worker, version.json, polling, pirâmide de testes, budgets |
| [09-licoes-debug.md](09-licoes-debug.md) | Acervo de lições, pasta `debug/`, limpeza proativa |
| [10-ia-agentes.md](10-ia-agentes.md) | IA/bots — **não se aplica** (registrado para consulta futura) |

## Regra de consulta
Antes de implementar: ler o arquivo relevante acima. Nunca começar do zero se o assunto já está documentado aqui.
Exemplos: deploy → `06-deploy.md`, segurança → `07-seguranca-auth.md`, migration → `05-supabase.md`.
