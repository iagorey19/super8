# Histórico de Sessões — THE SUPER 8

## 12/Set — Guias adaptados + debug/ + strict TS + version check

### Feito
- **Guias lidos e adaptados**: 25 templates lidos → `docs/padroes/` (README + 10 arquivos, sem links absolutos) — checklist do AGENTS.md marcado
- **`debug/` criado**: README, 6 scripts (`check-env/build/routes/processos/supabase/consultar-licoes`), `logs/dumps/fixes` (gitignorados), 4 checklists manuais (login, deploy, placar-ranking, segurança)
- **Acervo local**: `20-licoes-aprendidas/` + bug-001 (seed T3) documentado
- **TS strict**: `noUnusedLocals + noUnusedParameters + noImplicitAny` → 54 dead codes removidos (38 arquivos), `tsc` zero, zero `any`
- **Observabilidade**: `serverLogger` pino (arquivo em dev, stdout em prod) + `GET /api/debug/all` (só booleans) + `POST /api/logs` aceita `INFO`
- **Cache busting**: `public/version.json` gerado no `prebuild` + `<VersionCheck />` no layout (poll 60s, pausa oculta)
- **Deps**: `lucide-react@0.400.0` (travado, padrão guia 16) + `pino`
- **Segurança**: `proxy.ts` com `XSS + Permissions-Policy` · `.gitignore`: `debug/logs|dumps|fixes`, `data/logs`, sem `.vercel` duplicado
- **Docs**: AGENTS.md enxutado (Últimas Alterações: só 5) + CHANGELOG com entradas 22/07 (consolidação) e 12/09
- **Verificação**: `npx tsc --noEmit` ✅ zero · `npm run build` ✅ zero (rota `/api/debug/all` incluída)

### Lição desta sessão
Subagente de limpeza tocou 38 arquivos — working tree já estava sujo de sessões anteriores. Daqui em diante: `git status` no início da sessão para separar o que é pré-existente do que a sessão alterou.

### Incidente — EXEC_SQL_SECRET commitado + .env.local destruído (recuperado)
- **Causa 1**: `git add -A` sem `git status` antes → commitou `supabase/exec_sql_with_secret.sql` com o secret real (estava untracked).
- **Correção 1**: secret rotacionado 2x — banco (`supabase db query --linked --file` com SQL em `$env:TEMP`, apagado depois), `.env.local`, Vercel (`env rm` + `env add --sensitive`, redeploy via push). SQL do repo higienizados com placeholder. Valores mortos removidos da árvore (histórico do git ainda tem — aceito, precedente da sessão 21/07).
- **Causa 2**: `(Get-Content) ... | Set-Content -NoNewline` — `-NoNewline` com array **concatena tudo sem separador** → `.env.local` virou 1 linha de 356 chars com valores truncados.
- **Correção 2**: `vercel env pull --environment=production` (não-sensíveis) + `supabase projects api-keys` (service_role real) + AUTH_TOKEN novo local (dev é autoconsistente; produção intocada). Descobertas: `env pull` escreve `[Sensitive]` nos sensíveis; `GOOGLE_*` não é usado pelo código nem existe na Vercel — sem ação.
- **Regras novas**: nunca `Set-Content -NoNewline` com array; nunca `git add -A` sem `git status`; secrets só via variável, nunca impressos.

## 21/Jul — Documentação de Seed Data Loss + Atualização de Guias

### Feito
- **Seed data loss documentado**: T3 (3ª Edição) perdeu 28 matches + 16 results por reset sem backup
- **Inseridas 16 inscrições T3** no Supabase (dados recuperados do seed)
- **T3 permanece sem dados de jogos** (pairings, matches, results irrecuperáveis)
- **Guias universais atualizados** (`GUIAS GERAIS, PADRÕES - IAGO REY`):
  - Criado `20-licoes-aprendidas.md` — registry de bugs e lições (Bug #1: seed data loss)
  - Atualizado `06-supabase.md` — seção Seed Data Management
  - Atualizado `11-regras-negocio.md` — seção seed expandida
  - Atualizado `02-anti-breaking.md` — Mandamento #8 (Backup Antes de Reset)
  - Atualizado `README.md` — índice com novo guia
- **Docs do SUPER.8 atualizados**:
  - `.project-rules.md` — seção 6: Seed Data (regra crítica)
  - `AGENTS.md` — Lição Aprendida adicionada
  - `HISTORICO.md` — esta sessão
  - `CHANGELOG.md` — entry documentado

### Dados Restaurados no Supabase
| Torneio | Regs | Pairs | Matches | Results | Status |
|---------|------|-------|---------|---------|--------|
| T1 (1ª Ed.) | 16 | 28 | 28 | 16 | ✅ Completo |
| T2 (2ª Ed.) | 8 | 14 | 14 | 8 | ✅ Completo |
| T3 (3ª Ed.) | 16 | 0 | 0 | 0 | ⚠️ Só inscrições |
| T4 (4ª Ed.) | 16 | 28 | 28 | 16 | ✅ Completo |

## 18/Jul — PWA: instruções iOS corrigidas + replicação de guias do MASTER APP

### Feito
- **pwa-prompt.tsx**: Instruções iOS Safari corrigidas para 4 passos (3 pontinhos → Compartilhar → Ver mais → Adicionar à Tela Inicial)
- **atleta/page.tsx**: Seção Agradecimentos agora destaca REY MADEIRAS como "🏆 Tábua Oficial The Super 8" (full-width) igual à página pública do evento
- **.opencode/skills/supabase/SKILL.md**: Criado — comandos CLI, DDL, migrations, schema overview
- **.opencode/skills/deploy/SKILL.md**: Criado — workflow deploy, troubleshooting, env vars
- **docs/DATABASE.md**: Criado — schema completo das 16 tabelas com colunas, tipos, relacionamentos
- **HISTORICO.md**: Criado — registro de sessões para rastreamento
- **.project-rules.md**: Atualizado com padrões de código do MASTER APP (React 19, TypeScript, datas, moeda, mobile, react keys)
- **Build + Deploy**: ✅

### Testes Realizados
- Waiting list UI ✅
- GradePreview multi-categoria ✅ (grid + Exportar dropdown)
- Cookie login roundtrip ✅ (login → logout → relogin)
- Cadastro duplicate-email ✅ (mensagem com nome do atleta existente)
- ApproveAthlete financeiro ✅ (fix confirmado no código)
- PWA iOS instruções ✅

## 07/Jul — GradePreview modularizado + httpOnly cookie + waiting list

### Feito
- **Waiting list**: evento/[id]/page.tsx — botão "Entrar na lista de espera" quando categorias cheias
- **GradePreview**: modularizado em grade-types, grade-builder, grade-canvas, grade-exports; WHIST_SCHEDULE deduplicado
- **httpOnly cookie**: POST /api/auth/session → cookie 24h; GET valida; DELETE limpa
- **Auth callback**: cookie estendido para 24h; handler simplificado
- **store.ts**: fetchSessionFromCookie, getUserByEmail, async logout, approveAthlete com guard de payment
- **auth-context.tsx**: fallback para cookie quando sessionStorage vazio
- **Logo**: substituído public/images/logo-rey-madeiras.jpg por LOGOREY.jpg
- **AGENTS.md, CHANGELOG.md, .project-rules.md**: atualizados
- **Build + Deploy**: ✅
