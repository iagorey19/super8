<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — THE SUPER 8

## Skill Principal
Todo o contexto completo do projeto está na skill:
`.opencode/skills/super8/SKILL.md`

Inclui: stack, arquitetura, regras de negócio (Whist), padrões de código, protocolo anti-breaking, deploy, operação, e decisões técnicas.

Para carregar: `skill({ name: "super8" })`

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
| Database password | Supabase Dashboard > Project Settings > Database > Reset password |
| GitHub token | GitHub Settings > Developer settings > Personal access tokens |
| Vercel token | Vercel Dashboard > Settings > Tokens |

## Auto-Update
Ao alterar arquivos/testar, adicionar entrada no TOPO de Últimas Alterações (arquivo + resumo). Manter só últimas 5. Se conversa ~50 trocas, avisar: "⚠️ Conversa longa — sugiro `/salvar` e reiniciar."

## Últimas Alterações
- `AGENTS.md`: Simplificado — contexto movido para skill `.opencode/skills/super8/SKILL.md`
- `.opencode/skills/super8/SKILL.md`: Criada skill principal com stack, regras de negócio, padrões de código, anti-breaking, arquitetura, operação

## Próximos Passos
1. **Regra de desempate do ranking anual** — definir critério final
2. **`scripts/update-passwords.ts`** — revisar senhas no Supabase
3. **Migrar autenticação para Supabase Auth** (magic link, OAuth) — opcional
4. **Adicionar RLS policies** nas tabelas do Supabase
5. **Domínio personalizado** (TheSuper8.com.br) — comprar no registro.br, configurar no Vercel

---
_Atualizado em: 01/07/2026. Skill principal em `.opencode/skills/super8/SKILL.md`_
