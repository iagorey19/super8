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

## Guia de Conversação — Como Falar Comigo

### Como Pedir Algo
- **Seja direto**: "Preciso que crie X no arquivo Y" ou "Tem um bug em Z"
- **Contexto mínimo**: Se for mudança grande, explica o cenário (pra que serve, quem usa)
- **Print/snapshot**: Se viu algo na tela, inclui o que viu. Me ajuda a achar mais rápido.
- **Múltiplas tarefas**: Pode listar tudo de uma vez que eu priorizo e executo na ordem

### Como Dar Feedback
- **"Não era isso"** — Diga o que esperava e eu ajusto. Sem estresse.
- **"Faltou X"** — Só falar o que falta que eu completo.
- **"Ficou bom, mas..."** — Perfeito, já sei o que manter e o que mudar.
- **"Testei e deu erro"** — Include o que viu na tela ou no console.

### Commands Úteis
| Comando | O que faz |
|---------|-----------|
| `/salvar` | Eu atualizo AGENTS.md (Últimas Alterações), faço commit+push, e aviso que pode reiniciar a conversa |
| `/status` | Mostro resumo do estado atual do projeto |
| "builda/deploya" | Rodo build + push (deploy automático Vercel) |
| "testa X" | Abro o site e verifico X no navegador |
| "me mostra Y" | Leio o arquivo Y e mostro |
| "explica Z" | Explico como Z funciona |

### Quando a Conversa Fica Longa (~50 trocas)
- Eu aviso: ⚠️ Conversa longa
- Você faz `/salvar`
- Inicia uma conversa nova
- Eu continuo de onde parou (leio AGENTS.md + HISTORICO.md)

### Meu Estilo de Trabalho
1. **Planejo primeiro** — explico o plano antes de executar
2. **Pergunto se ambiguidade** — se não entendi, pergunto
3. **Token economy** — respostas curtas e diretas
4. **Build toda alteração** — sempre compilo antes de push
5. **Atualizo docs** — AGENTS.md + CHANGELOG + skills se necessário
6. **histórico** — toda sessão registrada em HISTORICO.md

## Auto-Update
Ao alterar arquivos/testar, adicionar entrada no TOPO de Últimas Alterações (arquivo + resumo). Manter só últimas 5. Se conversa ~50 trocas, avisar: "⚠️ Conversa longa — sugiro `/salvar` e reiniciar."

## Últimas Alterações
- `pwa-prompt.tsx`: Instruções iOS Safari corrigidas para 4 passos (3 pontinhos → Compartilhar → Ver mais → Adicionar à Tela Inicial)
- `atleta/page.tsx`: Seção Agradecimentos destaca REY MADEIRAS como "🏆 Tábua Oficial The Super 8" (full-width)
- `.opencode/skills/supabase/SKILL.md`: Criado — CLI Supabase, DDL, migrations, RLS, schema overview
- `.opencode/skills/deploy/SKILL.md`: Criado — deploy workflow, troubleshooting, env vars
- `docs/DATABASE.md`: Criado — schema completo das 16 tabelas com colunas, tipos, relacionamentos
- `HISTORICO.md`: Criado — registro de sessões
- `.project-rules.md`: Expandido com padrões de código (React 19 onChange, React Keys, mobile-first, segurança)

## Próximos Passos
1. **Auditoria de segurança completa** - Migrar rate limit para store compartilhado (Upstash Redis)

## Autenticação
- **Login**: `POST /api/auth/session` → busca user em `public.users`, `bcrypt.compare()`, retorna HMAC token + user + seta cookie httpOnly (24h)
- **Token**: HMAC-SHA256 com `AUTH_TOKEN_SECRET`, expira em 24h. Armazenado em cookie httpOnly + sessionStorage (cache)
- **Google OAuth**: `/auth/callback` → troca código por token Google → busca/cria user em `public.users` → seta cookie httpOnly (24h) → redirect para handler → página seguinte lê cookie via `GET /api/auth/session`
- **Password Reset**: `/auth/forgot-password` → `supabase.auth.resetPasswordForEmail()` → email com link → `/auth/reset-password` com OTP → atualiza Auth + `public.users`
- **Rate Limiting**: Login (5/min), POST data (30/min), admin-register (10/min), upload (30/min)
- `sessionStorage.getItem("super8-session")` → parse → `{ user, token }` (cache, cookie é canônico)

---
_Atualizado em: 18/07/2026_
