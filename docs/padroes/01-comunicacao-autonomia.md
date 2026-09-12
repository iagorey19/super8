# 01 — Comunicação, Autonomia e Skills

## Plano + autorização (sempre)
1. Explicar o plano em 2-3 frases (o quê / por quê / onde).
2. Usar `todowrite` se multi-passos.
3. Só executar após autorização explícita. Vale mesmo em modo autônomo.

## Autonomia — o que é automático pós-`ok`
Segurança, build/tipos, dependências, refactoring, migrations DDL (com backup se destrutivo),
docs/CHANGELOG, índices, dead code, lint, git/deploy, SQL via CLI Supabase.

## Perguntar se ambíguo
Feature com especificação vaga, design com múltiplas opções, regra de negócio/financeira,
deletar ou modificar dados de produção, mudar auth/RLS, valores financeiros, URLs de prod.

## NUNCA sem autorização explícita separada
Deletar dados de produção, mudar auth/RLS, commitar segredos, schema sem migration.

## Token economy + idioma
Respostas curtas e diretas; detalhar só se pedido. Comunicação/UI/comentários em pt-BR,
código em inglês, UTF-8 sem BOM.

## Auto-update
- Mudança significativa → entrada no TOPO de Últimas Alterações no `AGENTS.md` (manter só 5).
- `/salvar` = atualiza `AGENTS.md` + commit + push + avisa que pode reiniciar.
- `/status` = resumo do estado atual.
- Conversa ~50 trocas → avisar "⚠️ Conversa longa — sugiro `/salvar`".
- Mudou arquitetura → atualizar skill `super8`. Corrigiu bug → pasta em `20-licoes-aprendidas/`.

## MCPs e skills (12 MCPs sempre `enabled:true`, nunca `false`)
`agent-browser, codebase-memory, context7, supabase, google-workspace, github, shadcn,
playwright, chrome-devtools, sequential-thinking, waha/docker, telegram (só-envio)`.

| Situação | Ferramenta |
|----------|------------|
| Abrir/navegar/clicar/testar no site | agent-browser |
| Docs de libs (Next, Tailwind, Supabase) | context7 |
| Banco/auth/storage | supabase CLI/MCP |
| Explorar código/dependências | graphify (antes de grep/read) |
| UI nova ou redesign | ui-ux-pro-max + `DESIGN.md` |
| Antes de corrigir bug | `debug/scripts/consultar-licoes.ps1` |

## Gauntlet (tarefas visuais/complexas)
Toda tarefa tem um BAR (baseline nomeado e comparável). Crítico cego A vs B com evidência
(screenshot mobile 375px + desktop). Loop até a obra vencer o BAR. Humano é o freio (`pare`/`tá bom`).
**BAR padrão do super8**: telas de torneio de padel mobile-first @375px (confraternização > competição).
