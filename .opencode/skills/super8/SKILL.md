---
name: super8
description: Use for all work on THE SUPER 8 project. Covers Next.js 16 + Supabase stack, Whist tournament logic, scoring, categories, custom auth, data flow, deploy, and coding conventions. Trigger on any file in super8/ or when user mentions SUPER 8, super8, torneio, padel, Whist, americano.
---

# SKILL — THE SUPER 8

> Gerenciador de torneios de padel (Whist/Americano). Next.js 16 + Supabase + Tailwind CSS v4.

---

## 1. REGRAS DE INTERAÇÃO

### Para o usuário (como me comportar)
- **Sempre explico antes de fazer** qualquer alteração — qual o problema, solução, quais arquivos vou mexer
- **Planejo primeiro** e só executo depois da sua confirmação
- Se algo estiver **ambíguo ou incompleto**, pergunto antes de assumir
- **Token economy**: respostas curtas e diretas, sem explicações desnecessárias
- Se achar que o que pediu **não é o que realmente quer**, pergunto antes de agir

### Para a IA (regras internas)
1. Explicar o plano em 2-3 frases antes de qualquer alteração
2. Perguntar confirmação antes de executar
3. Se instrução ambígua, pedir esclarecimento
4. Ser conciso (economia de tokens)
5. Usar `todowrite` para planejamento multi-passos
6. Usar **sequential-thinking** para planejamento e raciocínio estruturado
7. **Sempre atualizar a skill** ao alterar arquitetura, padrões, ou regras relevantes

### Idioma
- **Comunicação**: Português-BR
- **Código** (variáveis, funções, tipos, arquivos): **Inglês**
- **UI do usuário**: Português-BR
- **Encoding**: UTF-8 sem BOM

### Comandos Rápidos
| Comando | Ação |
|---------|------|
| `/salvar` | Atualiza Status Atual no AGENTS.md e avisa que pode reiniciar conversa |
| `/status` | Resumo do estado atual do projeto |

### Conversa Longa
Se ultrapassar ~50 trocas, avisar: "⚠️ Conversa longa — sugiro `/salvar` e iniciar nova conversa."

---

## 2. PROTOCOLO ANTI-BREAKING

### Checklist obrigatório antes de finalizar sessão
- [ ] `npm run build` — ✅ zero erros (mandatório)
- [ ] `npx tsc --noEmit` — ✅ se disponível
- [ ] Nenhuma chave/secrets hardcodada
- [ ] Tipos alterados → TODOS consumidores verificados
- [ ] Store alterada → compatibilidade mantida (params opcionais continuam opcionais)
- [ ] Seed atualizado se tipos/estrutura mudaram
- [ ] Status Atual atualizado no AGENTS.md
- [ ] Deploy realizado (git push) se alteração significativa
- [ ] Skill atualizada se arquitetura/padrões mudaram

### Bash e Performance
| Regra | Descrição |
|-------|-----------|
| Timeout máximo | 30s para comandos bash (exceto instalação de pacotes) |
| Start-Sleep | NUNCA usar `Start-Sleep > 5 segundos` |
| Interrupção | Se usuário enviar mensagem enquanto comando roda, interromper imediatamente e responder |
| Polling | Preferir polling curto (< 5s) em vez de sleeps longos |
| Monitoramento | Usar `Get-Process` + `Get-Content -Tail N` para monitorar sem travar |

### Limpeza de Processos Node
Para matar processos `node.exe` órfãos (quando o sistema fica lento):
```powershell
# Mata todos node.exe exceto o terminal atual
Get-Process node | Where-Object { $_.Id -ne $PID } | Stop-Process -Force
```

### Edições Seguras
- Usar blocos de **3-5 linhas de contexto** nas âncoras de `edit`
- Sempre ler o arquivo antes de editar
- Evitar `replaceAll` a menos que seja realmente global
- Ao alterar tipos em `src/lib/types.ts`, verificar TODOS os consumidores

### Secrets
- **NUNCA hardcodar** chaves, senhas, tokens em arquivos de código
- Usar `.env.local` (gitignorado) para local
- Usar **Vercel Environment Variables** para produção
- Referenciar via `process.env.NEXT_PUBLIC_*` (Next.js) ou `process.env.*` (server-side)

---

## 3. STACK

| Camada | Tecnologia |
|--------|-----------|
| Framework | **Next.js 16** (App Router, `"use client"`) |
| Estilo | **Tailwind CSS v4** (paleta OKLCH) |
| Linguagem | **TypeScript** |
| Banco | **Supabase PostgreSQL** (16 tabelas, TEXT PRIMARY KEY) |
| API | `/api/data` (GET = fetch+seed, POST = persist via service_role) |
| Estado | Store centralizada (`src/lib/store.ts`) |
| Auth | Custom (`sessionStorage` + tabela `users`) |
| Deploy | **Vercel** (git push no master → auto-deploy) |
| Lint | ESLint v9 + `eslint-config-next` |

---

## 4. REGRAS DE NEGÓCIO

### Whist (Americano) — Formato do Torneio
- **8 atletas/grupo**, 7 rodadas, **2 quadras/rodada**
- Cada atleta faz dupla com todos exatamente **uma vez**
- Cada atleta enfrenta todos exatamente **duas vezes**
- `max_score` configurável por torneio (default 5)
- Quadras alternam em rodadas pares (courtA↔courtB) para balancear distribuição

### Pontuação
- Partida termina quando atleta atinge `max_score` games
- Tiebreak: se ambos em `max_score - 1`, vence por 2
- Ranking: **total_games** vencidos (desempate: confronto direto)
- Pontos por etapa: 1º=8pts, 2º=7pts … 8º=1pt
- Rankings anuais normalizam `total_games` proporcionalmente (`games * 5 / max_score`)

### Categorias
- **4e5**: Nível 4 e 5. Quadras A/B
- **6e7**: Nível 6 e 7. Quadras C/D
- Torneio pode ter 1 ou 2 categorias simultâneas
- Cada categoria tem grupo próprio de 8 atletas e ranking independente

### Perfis
| Perfil | Acesso |
|--------|--------|
| **Admin** | CRUD completo, aprovar/rejeitar, placar ao vivo, sorteios, financeiro, ranking anual |
| **Atleta** | Ver jogos/ranking, histórico, auto-cadastro, fotos |
| **Patrocinador** | Ver investimento, resultados, fotos, agradecimentos |
| **Apoiador** | Contribui com brindes. Sem login — cadastrado pelo admin |

---

## 5. ARQUITETURA

### Estrutura de Diretórios
```
super8/
├── src/
│   ├── app/              # App Router pages
│   │   ├── admin/        # Admin pages
│   │   ├── atleta/       # Athlete pages
│   │   ├── patrocinador/ # Sponsor pages
│   │   ├── eventos/      # Public events (sem login)
│   │   ├── auth/         # Login/cadastro
│   │   └── api/          # API routes (/api/data, /api/upload)
│   ├── components/
│   │   └── ui/           # Atomic UI components
│   ├── lib/
│   │   ├── store.ts      # Central store (toda lógica de negócio)
│   │   ├── types.ts      # TypeScript types
│   │   ├── supabase.ts   # Supabase client (anon + service_role)
│   │   ├── db/index.ts   # DB adapter (init, getData, setData, persist)
│   │   ├── seed.ts       # Seed data (auto-run quando DB vazio)
│   │   └── utils.ts      # Utility functions
│   └── contexts/         # React contexts
├── docs/                 # Documentation
└── supabase/             # Supabase CLI temp
```

### Data Flow
```
Navegador (store.ts)
  → fetch /api/data (GET/POST)
    → API Route serverless function
      → @supabase/supabase-js (service_role key)
        → PostgreSQL (Supabase)
```

### Componentes-chave
| Arquivo | Função |
|---------|--------|
| `src/lib/db/index.ts` | `init()`, `getData()`, `setData()`, `persist()` |
| `src/app/api/data/route.ts` | GET = fetch+seed, POST = persist |
| `src/lib/supabase.ts` | Cliente anon (browser) + service_role (server) |
| `src/lib/store.ts` | Store centralizada (toda lógica de negócio) |
| `src/lib/seed.ts` | Seed data (auto-run quando DB vazio) |
| `src/components/data-loader.tsx` | Inicializa dados no mount |
| `src/lib/chaveamento.ts` | Geração de pairings por rodada |
| `src/lib/export-spreadsheet.ts` | Export .xlsx (SheetJS) |

### Auth
- **Custom auth** (não Supabase Auth)
- Sessão em `sessionStorage` (chave: `super8-session`)
- Senhas armazenadas em texto puro (mantido do legado)
- Tabela `users` no Supabase com perfis: `admin`, `atleta`, `patrocinador`, `apoiador`

### Persistência
- `upsert` com `onConflict: "id"` (cria ou atualiza)
- `ignoreDuplicates: false` substitui registros pelo `id`
- NOT NULL columns exigem dados completos no upsert
- IDs seed são **strings textuais** (`"admin-001"`, `"torneio-001"`) — compatível com `TEXT PRIMARY KEY`
- Runtime: `crypto.randomUUID()` para novos registros

---

## 6. PADRÕES DE CÓDIGO

### Nomenclatura
| Contexto | Padrão | Exemplo |
|----------|--------|---------|
| Componentes React | PascalCase | `AthleteDashboard.tsx` |
| Páginas (App Router) | kebab-case | `ranking-anual`, `torneios/[id]/jogos` |
| Hooks | `use` + PascalCase | `useAuth`, `useStore` |
| Funções utilitárias | camelCase | `formatDate`, `getRevenueSourceLabel` |
| Tipos/Interfaces | PascalCase | `Tournament`, `Photo`, `AthleteStats` |
| Variáveis | camelCase | `tournamentId`, `maxScore` |

### TypeScript
- Tipos centralizados em `src/lib/types.ts`
- Ao alterar tipos, verificar TODOS os consumidores (componentes, hooks, seed)

### React
- **React 19 onChange**: usar `e.currentTarget.value` (NUNCA `e.target.value`)
- **React Keys**: proibido índices numéricos em listas com reordenação/filtragem
- Componentes têm `"use client"` (App Router client-side)

### Datas
- **Banco**: ISO strings (`"2026-06-21"` ou ISO completo com `T`)
- **UI**: `DD/MM/YYYY`
- `formatDate` em `src/lib/utils.ts`: detecta se string contém "T" (ISO) e faz `new Date()` direto

### Moeda
- `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`

### Mobile Responsiveness
- **TODAS as páginas** devem ser responsivas — usar `flex-wrap`, `grid-cols-1 sm:grid-cols-*`, `hidden sm:block`
- Botões de ação principais (Inscrever-se, Abrir Inscrições, Iniciar Torneio) devem ser **visíveis sem scroll** no mobile
- Telas de admin: botões de ação devem quebrar linha (`flex-wrap`) e ter `w-full sm:w-auto` no mobile
- Tabelas: usar `overflow-x-auto` + `min-w-[650px]` para scroll horizontal
- Modais: centralizados com `max-w-lg mx-auto` e padding adequado
- NUNCA usar `overflow-hidden` que esconda conteúdo em viewports pequenas

### Torneio — Ciclo de Vida
| Status | Descrição | Ação Admin | Ação Atleta |
|--------|-----------|------------|-------------|
| `upcoming` | Agendado, inscrições fechadas | "Abrir Inscrições" → muda para `registering` | Vê "Inscrições em breve" |
| `registering` | Inscrições abertas | "Iniciar Torneio" → muda para `ongoing`; pode inscrever manualmente, aprovar/rejeitar | "Inscrever-se" → PIX → aguarda aprovação |
| `ongoing` | Torneio em andamento | Gerenciar partidas, placar ao vivo | Ver jogos, ranking |
| `completed` | Torneio encerrado | Resultados finais, ranking | Histórico, estatísticas |

- Admin deve clicar "Abrir Inscrições" no **detalhe do torneio** ou na **lista de torneios**
- Inscrição pública fica disponível em `/eventos/[id]` apenas quando status = `registering`
- Admin pode inscrever manualmente durante `upcoming` e `registering`

### Fotos (Upload)
- Upload direto via **signed URL** (browser → Supabase Storage, sem passar pelo Vercel)
- `/api/upload` gera signed URL com service role
- Bucket `photos` com limite 20MB, RLS `allow_public_upload`
- `createPhoto(url, caption, uploadedBy, tournamentId?)` — `tournamentId` opcional
- Google Drive share links NÃO funcionam como fonte (CORS). Usar upload "Do Computador"

### Placar (Matches)
- `locked` inicia `false` para eventos novos
- `locked` fica `true` apenas se `status === "completed"` (derivado no loadData)
- Toggle manual 🔒/🔓 permanece

---

## 7. SUPABASE CLI — DDL REMOTO

A REST API (`@supabase/supabase-js`) **NÃO** suporta DDL. Usar Supabase CLI:

```bash
# Executar SQL no banco remoto
npx supabase db query --linked "ALTER TABLE tabela ADD COLUMN IF NOT EXISTS coluna TIPO DEFAULT valor;"

# Verificar resultado
npx supabase db query --linked "SELECT * FROM tabela LIMIT 5;" --output json
```

> ⚠️ Sempre usar `--linked` para remote. Sem `--linked` tenta conectar em localhost.
> Projeto ref: `ylltshboiejlcbhksrci`

---

## 8. DEPLOY

```bash
# Auto (push no master = Vercel auto-deploy ~1-2 min)
git add .
git commit -m "descrição"
git push

# Manual alternativo
npx vercel deploy --prod
```

Para ver status: https://vercel.com/iagorey19s-projects/super8

---

## 9. FERRAMENTAS MCP DISPONÍVEIS

Usar **sempre que relevante**, sem perguntar:

| Ferramenta | Quando usar |
|------------|-------------|
| **context7** | Buscar docs/código de bibliotecas (Next.js, Tailwind, Supabase) |
| **chrome-devtools** | Navegar no app live, tirar screenshot, debug visual, console, network requests |
| **github** | Acessar repositórios externos (buscar código, arquivos, issues, PRs) |
| **sequential-thinking** | **Sempre usar para planejamento e raciocínio** — mantém continuidade entre chamadas. Planejar, debater, confirmar, depois executar. |

**Ativação automática**: chrome-devtools e sequential-thinking são auto-invocados quando relevante.
**context7**: incluir no prompt quando precisar de docs recentes de bibliotecas.

---

## 10. LOGIN DE TESTE

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@super8.com | admin123 |
| Atleta | patricia@email.com | PatriciaRey123 |
| Patrocinador | patrocinador@email.com | patro123 |

---

## 10. MANUTENÇÃO DA SKILL

- **Local**: `.opencode/skills/super8/SKILL.md`
- **Sempre que** alterar algo significativo no projeto (arquitetura, stack, regras de negócio), atualize esta skill
- **Formato**: frontmatter YAML + markdown
- Para testar: inicie nova sessão — se aparecer em `<available_skills>`, está ok

---

_Baseado nos guias do MASTER APP (.project-rules.md, AGENTS.md, docs/*) e POKER (GUIA_COMUNICACAO_IA.md, GUIA_PADROES_CODIGO.md, GUIA_PROTOCOLO_ANTI_BREAKING.md, GUIA_ARQUITETURA.md)_
