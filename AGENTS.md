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

## Comandos Rápidos
| Comando | Ação |
|---------|------|
| `/salvar` | Atualiza Status Atual + avisa reiniciar conversa |
| `/status` | Resumo do estado do projeto |
| `npm run dev` | Rodar localmente |
| `npm run build` | Build de produção |
| `npx vercel deploy --prod` | Deploy manual na Vercel |

## Login de Teste
| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@super8.com | admin123 |
| Atleta | patricia@email.com | atleta123 |
| Patrocinador | patrocinador@email.com | patro123 |

## Auto-Update
Ao alterar arquivos/testar, adicionar entrada no TOPO de Últimas Alterações (arquivo + resumo). Manter só últimas 5. Se conversa ~50 trocas, avisar: "⚠️ Conversa longa — sugiro `/salvar` e reiniciar."

## Últimas Alterações
- `src/app/api/data/route.ts`: Reescrevido para Supabase — GET lê de 16 tabelas, POST faz upsert por lote. Seed automático se DB vazio
- `src/lib/supabase.ts`: Criado — cliente Supabase (browser com anon key, server com service_role)
- `scripts/migrate-to-supabase.ts`: Script para migrar `data/super8-db.json` → Supabase
- `docs/migration.sql`: SQL das 16 tabelas (TEXT PK, JSONB para arrays, indexes)
- `.env.local` + `.env.example`: Variáveis de ambiente (gitignorados)
- `src/components/admin-sidebar.tsx`: Menu hamburguer mobile (botão flutuante + drawer lateral)
- `src/components/annual-ranking.tsx`: Acordeão expansível — mostra torneios por atleta (posição, pontos, games)
- `src/lib/store.ts`: `computeAnnualRanking` agora retorna `tournaments[]` com dados de cada torneio

## Próximos Passos
1. Migrar autenticação para Supabase Auth (magic link, OAuth) — opcional
2. Adicionar RLS policies nas tabelas do Supabase
3. Domínio personalizado (TheSuper8.com.br) — comprar no registro.br, configurar no Vercel

---
_Atualizado em: 14/06/2026. Changelog completo: `docs/CHANGELOG.md`_
