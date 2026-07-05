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
- `AGENTS.md` + `ANCHORED_SUMMARY.md`: Removido In Progress "Migração bcrypt" — **completa**. 49 senhas hasheadas via `bcrypt.hashSync(pw, 10)`. Login usa `bcrypt.compare()` server-side. `POST /api/data` hasheia senhas antes de upsert. `GET /api/data` não retorna campo `password`. `store.login` agora chama `POST /api/auth/session` (async). Login page e auth-context migrados para async/await.
- `scripts/hash-passwords.mjs`: Deletado (script one-time executado).
- `api/auth/session/route.ts`: `bcrypt.compare()` substitui `===`; `password` removido do `user` retornado.
- `api/data/route.ts`: `import bcrypt` + `syncToSupabase` hasheia password de users individualmente; `GET` mapeia `password` para fora dos users retornados.
- `store.ts`: `login()` agora async, chama POST /api/auth/session. `fetchAuthToken` removido (dead code).
- `auth-context.tsx`: `login()` retorna `Promise<User | null>`.
- `auth/login/page.tsx`: `handleSubmit` async, `await login(email, password)`.

## Próximos Passos
1. **Deploy** — `git push` no master para sincronizar mudanças no Vercel
2. **Aprovar/Rejeitar da lista de espera** — admin poder mover atleta da espera para vaga quando alguém desiste
3. **Notificações no app do atleta** — exibir notificações de inscrição/pagamento no frontend do atleta
4. **Regra de desempate do ranking anual** — definir critério final

---
_Atualizado em: 01/07/2026. Skill principal em `.opencode/skills/super8/SKILL.md`_
