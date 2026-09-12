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
| `EXEC_SQL_SECRET` | `.env.local` + Vercel Env Vars (Production, Sensitive) — protege `exec_sql` no banco |
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

### Ferramentas CLI — Sempre usar terminal quando possível
**Regra**: Usar CLI sempre que disponível. Evitar navegador.

| CLI | Autenticado | Comandos úteis |
|-----|-------------|----------------|
| `supabase` (v2.108.0) | ✅ | `supabase projects list`, `supabase db push`, `supabase sql --query "..."` |
| `vercel` (v50.25.3) | ✅ | `vercel env ls`, `vercel env add KEY`, `vercel --prod` |
| `gh` (GitHub) | ✅ | `gh pr create`, `gh pr merge`, `gh issue list` |

**Exemplo de fluxo completo (mudança no banco + deploy):**
```bash
# 1. Criar migration local
# 2. Rodar no Supabase
supabase db push

# 3. Adicionar env var no Vercel
vercel env add EXEC_SQL_SECRET production

# 4. Deploy
vercel --prod
```

**Quando usar navegador:** Apenas para coisas que não têm CLI (ex: configurar billing, ver logs visuais, ajustes manuais pontuais).

### Quando a Conversa Fica Longa (~50 trocas)
- Eu aviso: ⚠️ Conversa longa
- Você faz `/salvar`
- Inicia uma conversa nova
- Eu continuo de onde parou (leio AGENTS.md + HISTORICO.md)

### Meu Estilo de Trabalho
1. **Executo sem pedir** — faço tudo que for técnico sem perguntar
2. **Build toda alteração** — sempre compilo antes de push
3. **Atualizo docs** — AGENTS.md + CHANGELOG + guias se necessário
4. **Documento tudo** — reporto o que fiz e por quê
5. **Token economy** — respostas curtas e diretas

### Cleanup do OpenCode (performance) — OBRIGATÓRIO ANTES DE CADA SESSÃO
**Problema**: Ao abrir múltiplos projetos ou sessões antigas, processos MCP duplicados acumulam (500MB+ RAM, 40s delay).
**Solução**: Rodar ANTES de iniciar qualquer tarefa:
```powershell
.\scripts\LIMPAR_MCPs.bat
```
Ou usar o `LIMPAR_MCPs.bat` na área de trabalho para limpeza rápida.
Ou manualmente: `.\scripts\cleanup-opencode.ps1`

**Nota**: Cada projeto tem MCPs diferentes. O `LIMPAR_MCPs.bat` de cada projeto mata apenas os MCPs daquele projeto específico.
**Referência completa**: `09-limpeza-proativa.md` (template) seção 5

### Regra de Início de Sessão
Ao iniciar conversa em qualquer projeto, SEMPRE:
1. Rodar `.\scripts\LIMPAR_MCPs.bat` (ou `.\scripts\cleanup-opencode.ps1`)
2. Aguardar conclusão
3. Then iniciar tarefas
**IMPORTANTE**: Ao abrir uma sessão ANTIGA, o opencode recria todos os MCPs — a limpeza é encore necessária.
**DICA**: Use o `LIMPAR_MCPs.bat` na área de trabalho para limpeza rápida antes de abrir qualquer projeto.

### Autonomia — O Que Faço Sozinho
**Regra**: Você revisa, eu executo.

| SEMPRE AUTÔNOMO | EXEMPLOS |
|-----------------|----------|
| Segurança | Rotacionar secrets, corrigir .gitignore, headers |
| Build/Lint | Rodar build, corrigir erros, ajustar tipos |
| Dependências | Instalar/remover packages |
| Refactoring | Extrair funções, renomear, mover arquivos |
| Migrations | Criar e rodar migrations DDL |
| Índices | Criar índices de performance |
| Documentação | Atualizar AGENTS.md, CHANGELOG, DATABASE.md |
| Código morto | Remover imports, funções, arquivos não usados |
| Git | Branches, commits, pushes |
| Deploy | vercel --prod |
| Banco direto | `supabase db query --linked --file X.sql` |

| PERGUNTAR SE AMBIGUO | QUANDO |
|----------------------|--------|
| Feature nova | Especificação ambígua |
| Design visual | Múltiplas opções |
| Regras de negócio | Lógica financeira/domínio |
| Dados produção | Deletar/modificar existentes |

**Referência completa**: `25-autonomia.md` (template)

## Auto-Update
Ao alterar arquivos/testar, adicionar entrada no TOPO de Últimas Alterações (arquivo + resumo). Manter só últimas 5. Se conversa ~50 trocas, avisar: "⚠️ Conversa longa — sugiro `/salvar` e reiniciar."

## Últimas Alterações
- Auditoria completa 12/09/2026 (P0): `POST/PUT /api/auth/password` — reset e troca de senha no servidor (bcrypt+Auth sync); `reset-password/page` sem service_role no browser; `updateAthlete` sem bcrypt client-side; `exec_sql` removido do banco (vazava secret nos postgres logs) + REVOKE/search_path nas RPCs debug
- Auditoria (P1): `isSafeRedirect` só interno (fim do open redirect); `admin-register` espelha `public.users`; storage `photos` INSERT só `authenticated`; `winner_id` anulável + `recordRaffle` vincula atleta; `seed` insere mesmo sem senha; `/api/debug/all` exige admin em prod; editions normalizadas (4ª/5ª)
- Auditoria (qualidade): eslint 0 errors (era 65) — modal `useId`, `stripPassword()`, dead code removido, `set-state-in-effect`→warn (hidratação client-side); tsc zero; `bcrypt` async; cookies `secure` só em prod; senha forte unificada
- Banco (P2): migration `index_cleanup` — 8 índices duplicados removidos, 1 constraint UNIQUE duplicada removida, 9 índices de FK criados
- `EXEC_SQL_SECRET` (segurança): `git add -A` commitou o secret real (estava untracked) → rotacionado 2x (banco + `.env.local` + Vercel Sensitive) + arquivos higienizados com placeholder. `.env.local` foi destruído no processo (`Set-Content -NoNewline` junta linhas!) → restaurado via `vercel env pull` + API do Supabase. Lição: nunca `-NoNewline` em array, nunca `add -A` sem `git status` antes

## Regras de Código
- **NÃO usar `any`** — Nunca usar `any`, `any[]`, `as any` em nenhum arquivo TypeScript. Usar tipos específicos, `unknown`, `Record<string, unknown>`, ou tipos de `src/lib/types.ts`. Supabase queries: usar `as unknown as { ... }` com tipos reais.
- **Limpeza do opencode** — Ao final de conversas longas (~50+ trocas), antes de `/salvar`, rodar `.\scripts\LIMPAR_MCPs.bat` para limpar processos MCP duplicados. Isso mantém o opencode rápido. O banco fica em `~\.local\share\opencode\opencode.db`.
- **Sessões antigas** — Ao abrir uma sessão antiga, o opencode recria todos os MCPs. SEMPRE rodar `.\scripts\LIMPAR_MCPs.bat` antes de iniciar.

## Skills Instaladas

| Skill | Para que serve | Quando usar |
|-------|---------------|-------------|
| **graphify** | Knowledge graph do código — mapeia arquitetura, dependências, relacionamentos entre arquivos | Explorar código complexo, entender fluxos, navegar o projeto sem grep |
| **ui-ux-pro-max** | Design intelligence — 84 estilos, 192 paletas, 74 combinações de fontes, 161 regras por indústria | Criar/alterar componentes visuais, gerar design systems, melhorar UI |
| **DESIGN.md** | Design system do Supabase (emerald green, Inter, monochrome) — referência visual | Quando o modelo gerar código visual, seguir os tokens deste arquivo |

### Graphify — Comandos
```
/graphify .                    # Mapeia todo o projeto (graphify-out/)
/graphify query "auth flow"    # Busca no grafo
/graphify path "Store" "Supabase"  # Caminho mais curto entre conceitos
/graphify explain "chaveamento"    # Explica um nó
```
**Resultado**: `graphify-out/` com graph.html (visual), graph.json (query), GRAPH_REPORT.md (resumo).

### REGRAS OBRIGATÓRIAS DE USO DE SKILLS
**ANTES de qualquer investigação, busca de código, ou entendimento de fluxo, SEMPRE:**
1. Consultar as skills disponíveis (graphify, etc.)
2. Usar a skill apropriada em vez de grep/read manual
3. Só usar ferramentas básicas (bash, grep, read) se a skill não resolver

**Exemplo:** Pra entender fluxo de dados → graphify, não grep + read + task agents.
**Motivo:** Economiza tokens, contexto, e é mais rápido.-graphify query responde em 1 query o que grep+read leva 5+ rounds.

### UI UX Pro Max — Uso
Ativa automaticamente quando pedir algo de UI/UX. Exemplos:
- "Faz um modal de confirmação estilo dark"
- "Cria uma landing page pro evento"
- "Melhora o design do dashboard do admin"
- Gera design system completo com cores, fontes, espaçamento, anti-patterns.

### DESIGN.md — Referência
Quando o modelo gerar código visual (botões, cards, modais, páginas), ele deve ler `DESIGN.md` na raiz para seguir os tokens do Supabase:
- Cor primária: `#3ecf8e` (emerald green)
- Botões: 6px radius, texto near-black no botão verde
- Fonte: Inter weight 500 para display, 400 para body
- Fundo: branco (`#ffffff`), dark: `#1c1c1c`

## Guias Universais — TEMPLATES PARA ADAPTAR E CONSULTAR

**ATENÇÃO:** Os guias abaixo são **templates de referência**, NÃO são para uso direto.
Leia-os, adapte as regras para o contexto deste projeto, e documente na pasta do projeto.

**PROIBIDO:** Criar referências diretas (caminhos absolutos) para `C:\Users\PC\Projetos\GUIAS GERAIS, PADRÕES - IAGO REY/` a partir deste projeto.

**REGRAS DE CONSULTA — SEMPRE VERIFICAR ANTES DE CRIAR:**
1. **ANTES** de implementar qualquer funcionalidade, consultar os guias relevantes
2. Se ja existe solucao documentada, usar como base e adaptar
3. **NUNCA** comecar do zero se o assunto ja esta documentado
4. Exemplos: deploy → `07-deploy.md`, seguranca → `21-seguranca.md`, supabase → `06-supabase.md`

**COMO USAR:**
1. Ler o guia relevante na pasta GUIAS GERAIS
2. Adaptar as regras para a stack e convenções deste projeto (Next.js 16, Supabase, Vercel)
3. Documentar as regras adaptadas neste AGENTS.md ou em arquivos específicos do projeto

| # | Template | O que cobre |
|---|----------|-------------|
| 01 | Comunicação com IA | Regras de interação, token economy, 15 regras da IA |
| 02 | Anti-Breaking | 7 mandamentos, edição segura, checklist pré-finalização |
| 03 | Stacks e Tecnologias | Vite, Next.js, Supabase, Zustand, etc |
| 04 | Padrões de Código | Nomenclatura, organização de arquivos, convenções |
| 05 | Design System | DESIGN.md canônico, Tailwind v4, Shadcn |
| 06 | Supabase | Migrations, RLS, DDL, persistência, CLI, React Query |
| 07 | Deploy | Vercel, env vars, GitHub, auto-deploy, cache busting |
| 08 | MCPs e Skills | Servidores MCP, skills, config opencode |
| 09 | Limpeza Proativa | Remover dead code, imports, logs desnecessários |
| 10 | Auto-Update | HISTORICO.md, Status Atual, /salvar |
| 11 | Regras de Negócio | Multi-tenancy, seed, lifecycle, waiting list, notifications |
| 12 | TypeScript Strict | Regras TS, erros comuns, proibições |
| 13 | React 19 | e.currentTarget, keys, lazy-loading, Suspense |
| 14 | Tailwind CSS v4 | CSS-first, OKLCH, @theme, tokens |
| 15 | Zustand | Padrões de store, persistência, selectors |
| 16 | Lucide Icons | Nomenclatura v0.x, mapeamento proibido |
| 17 | Animações | Framer Motion, padrões de animação |
| 18 | Scripts Utilitários | PowerShell, diagnóstico, automações, limpeza processos |
| 19 | Credenciais Login | Cookie+sessionStorage, OAuth, password reset |
| 20 | Lições Aprendidas | Bugs encontrados, causas, soluções e prevenção |
| 21 | Segurança | XSS, open redirect, security headers, rate limiting, Zod |
| 22 | IA e Agentes | Arquitetura de agente IA, pipeline OCR, API keys |
| 23 | PWA e Service Worker | Cache strategy, service worker, cache busting mobile |
| 24 | Testes | Planos de teste, troubleshooting, checklist pós-deploy |
| 25 | Autonomia | Operação autônoma, o que executar sem perguntar |

**Regras adaptadas (fonte canônica local)**: `docs/padroes/` (README + 10 arquivos, sem links absolutos).
Os templates originais ficam fora do projeto (apenas leitura/referência) — nunca referenciar por caminho absoluto no código ou docs.

### Checklist obrigatório
- [x] Todos os 25 templates lidos e adaptados em `docs/padroes/`
- [x] Regras de 01 (Comunicação) adaptadas em `01-comunicacao-autonomia.md`
- [x] Anti-breaking 02 verificado (`02-anti-breaking.md`)
- [x] TypeScript strict 12 habilitado (`tsconfig` + tsc zero)
- [x] React 19 rules 13 seguidas (`03-stack-codigo.md`)
- [x] Padrões de código 04 aplicados (`03-stack-codigo.md`)
- [x] Design system 05 seguido (`DESIGN.md` + `04-design-system.md`)
- [x] Supabase 06 configurado (`05-supabase.md`)
- [x] Deploy 07 preparado (`06-deploy.md`)
- [x] Segurança 21 verificada (`07-seguranca-auth.md`)
- [x] Autonomia 25 configurada (`01-comunicacao-autonomia.md`)

## Próximos Passos
1. **Date handling** — Padronizar formato de datas (L05)
2. **Auditoria de segurança completa** — Migrar rate limit para store compartilhado (Upstash Redis)
3. **Seed data** — Atualizar seed.ts com dados dos torneios completos (T1, T2, T4). T3 sem dados de jogos (perdidos no reset — ver lição abaixo)

## Lição Aprendida — Perda de Dados do T3
O seed foi escrito quando T3 era `upcoming` — só tinha inscrições, sem jogos. Matches do T3 foram inseridos via app mas não no seed. Quando o Supabase foi resetado, 28 matches do T3 foram perdidos permanentemente. **Sempre atualizar seed após cada torneio completo. Sempre fazer backup antes de reset.** Ver detalhes em `20-licoes-aprendidas.md` (template).

## Autenticação
- **Login**: `POST /api/auth/session` → busca user em `public.users`, `bcrypt.compare()`, retorna HMAC token + user + seta cookie httpOnly (24h)
- **Token**: HMAC-SHA256 com `AUTH_TOKEN_SECRET`, expira em 24h. Armazenado em cookie httpOnly + sessionStorage (cache)
- **Google OAuth**: `/auth/callback` → troca código por token Google → busca/cria user em `public.users` → seta cookie httpOnly (24h) → redirect para handler → página seguinte lê cookie via `GET /api/auth/session`
- **Password Reset**: `/auth/forgot-password` → `supabase.auth.resetPasswordForEmail()` → email com link → `/auth/reset-password` com OTP → atualiza Auth + `public.users`
- **Rate Limiting**: Login (5/min), POST data (30/min), admin-register (10/min), upload (30/min)
- `sessionStorage.getItem("super8-session")` → parse → `{ user, token }` (cache, cookie é canônico)

---
_Atualizado em: 12/09/2026_
