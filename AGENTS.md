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

## Ferramentas (MCPs) Disponíveis
Usar **sempre que relevante**, sem perguntar — agilidade e precisão:

| Ferramenta | Quando usar |
|------------|-------------|
| **context7** | Buscar docs/código de bibliotecas (Next.js, Tailwind, etc.) |
| **chrome-devtools** | Navegar, tirar screenshot, debug visual, console, network |
| **github** | Acessar repositórios externos (buscar código, arquivos, issues) |
| **sequential-thinking** | **Sempre usar para planejamento e raciocínio** — mantém continuidade entre chamadas, não perde contexto. Planejar, debater com o usuário para confirmar, depois executar. |

## Arquitetura
- **Stack**: Next.js 16 + Tailwind CSS v4 + TypeScript (App Router, `"use client"`)
- **Data**: `data/super8-db.json` via API `/api/data`. Sessão: `sessionStorage`
- **Perfis**: Admin, Atleta, Patrocinador, Apoiador
- **Torneio**: Whist (Americano) — 8 atletas, 7 rodadas, 2 quadras/categoria
- **Área pública**: `/eventos/*` — sem login

## Comandos Rápidos
| Comando | Ação |
|---------|------|
| `/salvar` | Atualiza Status Atual + avisa reiniciar conversa |
| `/status` | Resumo do estado do projeto |

## Auto-Update
Ao alterar arquivos/testar, adicionar entrada no TOPO de Últimas Alterações (arquivo + resumo). Manter só últimas 5. Se conversa ~50 trocas, avisar: "⚠️ Conversa longa — sugiro `/salvar` e reiniciar."

## Últimas Alterações
- `src/lib/types.ts`, `src/lib/store.ts`, `src/app/admin/patrocinadores/page.tsx`: Adicionado campo "Link (site/redes)" para patrocinadores — exibido como link clicável na tabela e nas páginas públicas de eventos
- `src/app/eventos/[id]/page.tsx`, `src/app/eventos/[id]/ranking/page.tsx`: Nome do patrocinador vira link se possuir URL; brindes dos apoiadores mostram tipo (Kit/Sorteio)
- `src/app/atleta/page.tsx`: Status da inscrição agora claro para todos os estados (pendente ✅/aprovado ✅/rejeitado ❌)
- `src/app/admin/patrocinadores/page.tsx`: Adicionadas abas "Patrocinadores" + "Apoiadores" — apoiadores movidos do torneio para cá, com seletor de torneio e CRUD completo
- `src/app/admin/torneios/[id]/page.tsx`: Removida seção de apoiadores (transferida para patrocinadores)

## Próximos Passos
1. Migrar para Supabase (trocar `db/index.ts` + API route)
2. Preparar deploy na Vercel

## Login de Teste
| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@super8.com | admin123 |
| Atleta | patricia@email.com | atleta123 |
| Patrocinador | patrocinador@email.com | patro123 |

---
_Atualizado em: 12/06/2026. Changelog completo: `docs/CHANGELOG.md`_
