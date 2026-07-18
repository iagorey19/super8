# Histórico de Sessões — THE SUPER 8

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
