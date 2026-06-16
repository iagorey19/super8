<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — THE SUPER 8

## Regras de Idioma
1. **Idioma**: Português-BR (código: inglês para variáveis, funções, tipos)
2. **Encoding**: UTF-8 sem BOM

## Protocolo Anti-Breaking
1. **Build obrigatório**: `npm run build` antes de finalizar sessão
2. **Tipos**: Respeitar `src/lib/types.ts` — alteração atualiza TODOS consumidores
3. **Store**: Funções em `src/lib/store.ts` preservam compatibilidade. Parâmetros opcionais (`?`) nunca obrigatórios
4. **Seed**: Após alterar tipos, verificar `src/lib/seed.ts`
5. **Secrets**: NUNCA hardcodar chaves (API keys, passwords, tokens) em arquivos de código. Usar `.env.local` (gitignorado) para local, Vercel Env Vars para produção

## Ferramentas (MCPs) Disponíveis
Usar **sempre que relevante**, sem perguntar — agilidade e precisão:

| Ferramenta | Quando usar |
|------------|-------------|
| **context7** | Buscar docs/código de bibliotecas (Next.js, Tailwind, etc.) |
| **chrome-devtools** | Navegar, tirar screenshot, debug visual, console, network |
| **github** | Acessar repositórios externos (buscar código, arquivos, issues) |
| **sequential-thinking** | **Sempre usar para planejamento e raciocínio** — mantém continuidade entre chamadas, não perde contexto. Planejar, debater com o usuário para confirmar, depois executar. |

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

## Arquitetura

### Stack
- **Next.js 16** + Tailwind CSS v4 (OKLCH) + TypeScript (App Router, `"use client"`)
- **Torneio**: Whist (Americano) — 8 atletas, 7 rodadas, 2 quadras/categoria
- **Perfis**: Admin, Atleta, Patrocinador, Apoiador
- **Área pública**: `/eventos/*` — sem login

### Data Flow
```
Navegador (store.ts)
  → fetch /api/data (GET/POST)
    → API Route serverless function
      → @supabase/supabase-js (service_role key)
        → PostgreSQL (Supabase)
```

- `src/lib/db/index.ts` — inalterado, ainda exporta `init()`, `getData()`, `setData()`, `persist()`
- `src/app/api/data/route.ts` — reescrito: lê/escreve no Supabase em vez de `data/super8-db.json`
- `src/lib/supabase.ts` — cliente compartilhado (anon para browser, service_role para server)
- Auth permanece custom: `sessionStorage` + tabela `users` (password em texto puro — mantido do legado)
- Persistência usa `upsert` com `onConflict: "id"` (cria ou atualiza registros)

### Observações Técnicas
- `crypto.randomUUID()` gera UUIDs v4 para novos registros (runtime)
- Seed (`src/lib/seed.ts`) usa IDs textuais como `"admin-001"`, `"torneio-001"` — compatível com `TEXT PRIMARY KEY` no Supabase
- `upsert` com `ignoreDuplicates: false` substitui registros existentes pelo `id`
- NOT NULL columns exigem dados completos no upsert (não é possível upsert parcial)

## Supabase CLI — DDL (ALTER TABLE, CREATE TABLE, etc.)
A REST API (`@supabase/supabase-js`) **NÃO** suporta DDL. Para alterar schema do banco remoto:

```bash
# Primeira vez: linkar o projeto (já feito, não repetir)
npx supabase link --project-ref ylltshboiejlcbhksrci

# Executar SQL no banco remoto
npx supabase db query --linked "ALTER TABLE tabela ADD COLUMN IF NOT EXISTS coluna TIPO DEFAULT valor;"

# Verificar resultado
npx supabase db query --linked "SELECT * FROM tabela LIMIT 5;" --output json
```

> ⚠️ Sempre usar `--linked` para remote. Sem `--linked` tenta conectar em localhost.

## Fluxo de Deploy
O Vercel está integrado ao GitHub. **Push no `master` = deploy automático.**

```
git add .
git commit -m "descrição"
git push
# Aguardar ~1-2 min, Vercel faz o resto
```

Para ver o status do deploy: https://vercel.com/iagorey19s-projects/super8

## Comandos Rápidos
| Comando | Ação |
|---------|------|
| `/salvar` | Atualiza Status Atual + avisa reiniciar conversa |
| `/status` | Resumo do estado do projeto |
| `npm run dev` | Rodar localmente |
| `npm run build` | Build de produção |
| `git push` | Sobe alterações → Vercel deploys automático |
| `npx vercel deploy --prod` | Deploy manual alternativo |
| `npx supabase db query --linked "SQL"` | Executar DDL/DML no Supabase remoto |

## Login de Teste
| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@super8.com | admin123 |
| Atleta | patricia@email.com | PatriciaRey123 |
| Patrocinador | patrocinador@email.com | patro123 |
| Patrocinador (real) | Aromorie@email.com | (definida pelo admin) |

## Auto-Update
Ao alterar arquivos/testar, adicionar entrada no TOPO de Últimas Alterações (arquivo + resumo). Manter só últimas 5. Se conversa ~50 trocas, avisar: "⚠️ Conversa longa — sugiro `/salvar` e reiniciar."

## Últimas Alterações
- `AGENTS.md`: Documentado `supabase db query --linked` para DDL remoto. Adicionado checklist de próximos passos
- `src/lib/types.ts` + `docs/migration.sql`: Adicionado campo `max_score?: number` ao Tournament (default 5)
- `src/lib/store.ts`: `updateMatchScore` usa `tournament.max_score` em vez de hardcoded 5. `computeAnnualRanking` normaliza `total_games` por `max_score`. `getAthleteStats` normaliza `avgScore`. `unregisterAthlete` e `rejectAthlete` removem receita de inscrição ao remover atleta
- `src/app/admin/torneios/[id]/page.tsx`: Botão **Check-in** para admin. Campo "Games até (max)" no modal de editar torneio
- `src/app/admin/torneios/page.tsx`: Campo "Games até (max)" no modal de criar/editar torneio
- `src/app/eventos/ranking-anual/page.tsx`: Corrigido `PublicNavbar` duplicado (layout já renderizava)
- `src/lib/seed.ts`: 1ª Edição com `max_score: 4`
- `src/app/patrocinador/investimento/page.tsx`: Adicionado card "Receitas por Fonte" expansível
- `src/lib/utils.ts`: Helpers `getRevenueSourceLabel`, `getRevenueSourceIcon`

## Próximos Passos
1. **Regra de desempate do ranking anual** — definir critério final (user ainda não decidiu 100%)
2. **`scripts/update-passwords.ts`** — revisar se senhas no Supabase estão sincronizadas com seed
3. **Migrar autenticação para Supabase Auth** (magic link, OAuth) — opcional
4. **Adicionar RLS policies** nas tabelas do Supabase
5. **Domínio personalizado** (TheSuper8.com.br) — comprar no registro.br, configurar no Vercel

## Checklist de DDL no Supabase Remoto
Sempre que precisar alterar schema, usar Supabase CLI:

```bash
npx supabase db query --linked "ALTER TABLE tabela ADD COLUMN IF NOT EXISTS coluna TIPO;"
```

Verificar alterações no `docs/migration.sql` para manter histórico.

---
_Atualizado em: 15/06/2026. Changelog completo: `docs/CHANGELOG.md`_
