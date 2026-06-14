# Changelog — THE SUPER 8

_Histórico completo de alterações. Consulte AGENTS.md para as últimas 5._

---

## 12/Jun/2026

- `src/app/admin/patrocinadores/page.tsx`: Adicionadas abas "🤝 Patrocinadores" e "🙌 Apoiadores" — apoiadores movidos do torneio para cá, com seletor de torneio, CRUD completo (editar/remover apoiadores e brindes), kit com quantidade = total de atletas do evento (`categorias × 8`)
- `src/app/admin/torneios/[id]/page.tsx`: Removida seção e modais de apoiadores/brindes (transferidos para patrocinadores); removidas `totalEventCapacity` e handlers de apoiadores do escopo
- `src/lib/store.ts`: Novas funções `updateApoiador(id, updates)` e `updateBrinde(id, updates)` — editar nome/telefone do apoiador e descrição/quantidade/tipo do brinde
- `src/lib/types.ts`: Adicionado `registration_fee?: number` ao `Tournament` — valor da inscrição por torneio
- `src/lib/store.ts`: `createTournament()` agora aceita `registration_fee` opcional; `approveAthlete()` cria automaticamente Receita com `source: "inscricao"` e valor do fee quando torneio possui `registration_fee`
- `src/app/admin/torneios/page.tsx`: Adicionado campo "Valor da Inscrição (R$)" no modal de criar/editar torneio
- `src/app/admin/torneios/[id]/page.tsx`: Adicionado campo "Valor da Inscrição (R$)" no modal de editar torneio
- `src/lib/seed.ts`: Adicionado `registration_fee: 50` nos 3 torneios seed; SEED_VERSION bump 6 → 7
- `src/app/admin/patrocinadores/page.tsx`: Gerenciamento completo de patrocínios por patrocinador — lista expansível (▼/▲), criar/editar/remover via modal; botão "+ Novo Patrocínio" inline
- `src/lib/store.ts`: Nova função `updateSponsorship(id, updates)` — atualiza tier/amount/description/tournament_id; `createSponsorship()` agora cria Receita automaticamente (sync patrocínio → financeiro); `deleteSponsorship()` remove receita vinculada
- `src/app/admin/usuarios/page.tsx`: Nova página de gestão de usuários — tabela com todos os perfis, badges de role, modal Novo/Editar usuário (com senha opcional), remover com confirmação
- `src/components/admin-sidebar.tsx`: Adicionado link "Usuários" (🔐)
- `src/app/admin/atletas/page.tsx`: Botão "Adicionar Atleta" + modal usando `createUser()` (role "athlete")
- Logo: Substituído texto "S8" por `<img src="/logo.jpg">` em 5 páginas — landing (h-28), login/cadastro (h-20), navbars (h-14)
- `src/app/eventos/[id]/page.tsx`, `src/app/eventos/[id]/ranking/page.tsx`: Adicionada seção "🤝 Agradecimentos" com lista de patrocinadores, apoiadores e (no ranking) ganhadores de sorteio
- `src/lib/store.ts`: Novas funções genéricas `getAllUsers()`, `createUser()`, `updateUser()`, `deleteUser()` para CRUD de usuários admin

## 10/Jun/2026

- `src/app/patrocinador/investimento/page.tsx`: Despesas por categoria agora collapsíveis (recolhidas por padrão, expande ao clicar com ▼)
- `src/app/admin/sorteador/numeros/page.tsx`: Sorteio de números alterado para um-atleta-por-clique com animação de suspense (15 steps, 200ms)
- `src/app/admin/financeiro/page.tsx`: Seletor de categoria substituído por grid de emojis (sempre visível) + Select de fallback; botões ✏️ editar despesas/receitas
- `src/lib/store.ts`: Novas funções `updateExpense()`, `updateRevenue()`, `drawSingleNumber()`
- `src/lib/types.ts`: Adicionado `"brindes"` ao tipo `ExpenseCategory`
- `src/lib/utils.ts`: `getCategoryLabel`/`getCategoryIcon` incluem `"brindes"` (🎁)
- `src/app/api/data/route.ts`: GET agora faz auto-migration de `raffle_records` (`??= []`) para dados legados
- `data/super8-db.json`: Re-adicionado seed sponsor `spo-001` (patrocinador@email.com / patro123) com `spo-cota-001` sponsorship; modal criar patrocinador agora tem campo de senha
- `src/lib/store.ts`: `createSponsor` aceita parâmetro `password` (não mais hardcoded)
- `src/app/patrocinador/investimento/page.tsx`: Despesas agora listam itens individuais (descrição + valor)
- `src/app/admin/patrocinadores/page.tsx`, `src/app/admin/torneios/[id]/page.tsx`: Layouts com role check corrigido — admin pode acessar área de patrocinador/atleta
- `AGENTS.md`, `SETUP.md`, `.project-rules.md`: Otimizados — removida duplicação, changelog movido para `docs/CHANGELOG.md`
- `docs/CHANGELOG.md`: Criado com histórico completo
- `src/app/atleta/jogos/page.tsx`, `src/app/atleta/page.tsx`: Adicionada seção "Sorteios" que exibe `raffle_records` do torneio
- `src/lib/store.ts`: Função `recordRaffle()` — persiste registro de sorteio com `winner_name` e `brinde_description`
- `src/lib/store.ts`: Corrigido syntax error (orphaned `saveData` + `return` pós-refatoração)
- `src/app/admin/sorteador/brindes/page.tsx`: Sorteio por números agora salva vencedor em `raffle_records` via `recordRaffle()`

## 09/Jun/2026

- `src/app/admin/torneios/[id]/page.tsx`: Adicionado Aprovar/Rejeitar direto na página do evento, sem precisar ir em Atletas
- `src/app/admin/torneios/[id]/page.tsx`: `handleStartAll` agora trata cada categoria independentemente — erro em uma não quebra as outras
- `src/app/admin/torneios/page.tsx`: `handleStart` valida TODAS as categorias antes de iniciar + inicia cada uma com try/catch individual
- `src/lib/store.ts`: `registerAthleteInTournament` agora faz `group_name: groupName || "A"` (nunca fica `undefined`)
- `src/lib/store.ts`: `startTournament` e `drawNumbers` agora aceitam `group_name: undefined` como grupo "A"
- `src/app/admin/torneios/[id]/page.tsx`: `allAthletes` movido para `useEffect` com try/catch — não quebra a página se banco não estiver pronto
- `src/app/admin/torneios/[id]/page.tsx`: Botão único "Iniciar Torneio" — inicia TODAS as categorias simultaneamente
- `src/app/admin/torneios/page.tsx`: `handleStart` agora inicia todas as categorias inline (sem redirecionar)
- `src/lib/seed.ts`: 3ª Edição agora tem 8 atletas por categoria (16 total, status `approved`)
- `src/lib/seed.ts`: SEED_VERSION bumped para 6
- `src/app/api/data/route.ts`: POST agora valida `seed_version` (rejeita dados corrompidos)

## 08/Jun/2026

- ✅ Migração completa: localStorage → `data/super8-db.json` via API (`/api/data`)
- `src/lib/seed.ts`: Agora exporta `seed()` como função (sem auto-run no módulo)
- `src/lib/db/index.ts`: In-memory data store com `init()` + `persist()` via fetch
- `src/app/api/data/route.ts`: GET (seeda se arquivo não existe) + POST (persiste)
- `src/components/data-loader.tsx`: Inicializa dados no mount, limpa `localStorage["super8-data"]`, loading/error states
- `src/lib/store.ts`: Substituído `seedData` import + localStorage por `db.getData()`/`db.setData()` + `db.persist()`; adicionado `initData()`
- `src/app/layout.tsx`: Envolve `<Providers>` com `<DataLoader>`
- `.gitignore`: Adicionado `/data/` (com `/data/.gitkeep`)
- `src/app/admin/sorteador/numeros/page.tsx`: Corrigido — botão "Sortear Números" exige seleção de categoria em torneios multi-categoria

## 07/Jun/2026

- `src/app/atleta/page.tsx`: Adicionado "Editar Perfil" — atleta pode alterar nome/email/telefone
- `src/app/patrocinador/page.tsx`: Adicionado "Editar Perfil" — patrocinador pode alterar nome/email/telefone
- `src/app/admin/patrocinadores/page.tsx`: Adicionado botão "Editar" + modal para alterar dados do patrocinador
- `src/lib/store.ts`: Nova função `updateSponsor`
- `src/app/admin/sorteador/brindes/page.tsx`: Corrigido — auto-raffle agora tem animação de suspense; remover vencedor funciona por nome
- `src/app/admin/atletas/page.tsx`: Corrigido — ao registrar atleta, categoria é sempre passada (conserta "Iniciar Torneio")
- `src/app/admin/torneios/[id]/page.tsx`: Corrigido — ao registrar atleta pelo evento, categoria é sempre passada
- `src/app/admin/torneios/[id]/page.tsx`: Adicionado botão "Remover" atleta + modal "Registrar Atleta" direto no evento
- `src/app/admin/atletas/page.tsx`: Coluna "Torneio" na tabela de pendentes; approve/reject agora usam `registration_id`
- `src/lib/store.ts`: `getPendingAthletes()` retorna `tournament_title`; `approveAthlete`/`rejectAthlete` usam `registration_id`; nova função `unregisterAthlete`

## 06/Jun/2026

- `src/lib/logger.ts` + `src/app/api/logs/route.ts`: Sistema de logs — erros do navegador salvos em `logs/super8-YYYY-MM-DD.log`
- `src/components/error-logger.tsx`: Componente que captura `window.onerror`, unhandled rejections e `console.error`
- `src/app/layout.tsx`: Integrado ErrorLogger
- `.gitignore`: Adicionado `/logs/`
- `src/app/eventos/*`: Criada área pública `/eventos` (lista, detalhe, jogos, ranking) — sem login necessário
- `src/components/public-navbar.tsx`: Navbar pública com logo + Entrar/Cadastrar
- `src/app/page.tsx`: Adicionado botão "Acompanhar Eventos" na landing page
- `src/lib/seed.ts`: Unificado ranking anual 2026 combinando T1 + T2 — Patricia Rey lidera com 12 pts (2 torneios)
- `src/lib/seed.ts`: Datas corrigidas — T1: 17/01, T2: 30/05, T3: 20/06
- `src/lib/seed.ts`: Populada 1ª Edição completa (Grupo A + B) com dados extraídos do PDF SUPER8.!EDT — 28 pares, 28 partidas, 16 resultados
- `src/lib/seed.ts`: Inseridos dados reais da 2ª Edição extraídos da planilha
- `src/lib/seed.ts`: Renomeado `ath-001` → Dani Madeli, `ath-004` → Patricia Rey
- `src/lib/seed.ts`: Corrigido T3 categorias de `6e7` para `6e6`

## 05/Jun/2026

- `src/app/admin/atletas/page.tsx`: Botão "Editar" atleta + modal edição (nome, email, telefone) + import `updateAthlete`, `Input`
- `src/lib/store.ts`: Função `updateAthlete` adicionada
- `AGENTS.md`, `src/app/admin/torneios/page.tsx`: Botão "Excluir" na listagem de torneios
- `src/app/admin/atletas/page.tsx`: Botão "Remover" atleta + import `deleteAthlete`
- `src/app/admin/patrocinadores/page.tsx`: Botão "Remover" patrocinador + import `deleteSponsor`
- `src/app/admin/fotos/page.tsx`: Botão ✕ para remover foto
- `src/app/admin/financeiro/page.tsx`: Botão ✕ para remover despesas e receitas
- `src/app/admin/torneios/[id]/page.tsx`: Modal de edição (título, edição, data, local, categorias) + botão "Excluir" torneio
- `src/lib/store.ts`: Novas funções `deleteTournament`, `deleteAthlete`, `deleteSponsor`, `deleteSponsorship`, `deletePhoto`, `deleteExpense`, `deleteRevenue`
- `AGENTS.md`: Reescrito com protocolo completo, auto-update, comandos e Status Atual
- `.project-rules.md`: Criado com regras de negócio e arquitetura
- `SETUP.md`: Criado com guia de setup/restauração
- `src/app/admin/sorteador/brindes/page.tsx`: Integração de brindes tipo sorteio com auto-raffle
- `src/app/patrocinador/resultados/page.tsx`, `src/app/admin/torneios/[id]/ranking/page.tsx`: Seção "Agradecimentos" com patrocinador + apoiadores
- `src/app/admin/torneios/[id]/page.tsx`: CRUD de apoiadores e brindes inline
- `src/lib/store.ts`: Funções CRUD para apoiadores/brindes (`createApoiador`, `getApoiadores`, `addBrinde`, `raffleBrinde`, etc)
- `src/lib/types.ts`: Interfaces `Apoiador`, `Brinde` adicionadas
- `src/lib/seed.ts`: Arrays `apoiadores`, `brindes` adicionados ao seed
