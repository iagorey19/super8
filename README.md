# THE SUPER 8

Sistema de gestão de torneios de padel feminino no formato Whist (Americano).

**Live**: https://super8-three.vercel.app

## Funcionalidades

- **Torneios**: Criar, editar, gerenciar torneios com 1 ou 2 categorias simultâneas (4e5 / 6e7)
- **Inscrições**: Auto-inscrição com PIX, lista de espera, fila por ordem de chegada
- **Chaveamento Whist**: Geração automática de 7 rodadas com 2 quadras, cada atleta dupla com todos exatamente uma vez
- **Placar ao Vivo**: Atualização de scores em tempo real, ranking ao vivo
- **Ranking Anual**: Pontuação acumulada por categoria
- **Financeiro**: Despesas e receitas por torneio, PIX, controle de pagamentos
- **Sorteios**: Brindes e números da sorte com animação
- **Fotos**: Galeria de fotos por torneio
- **Autenticação**: Login com email/senha (bcrypt) e Google OAuth
- **Perfis**: Admin, Atleta, Patrocinador com visões específicas
- **Notificações**: Sistema interno de notificações por usuário

## Stack

- **Frontend**: Next.js 16, Tailwind CSS v4, TypeScript
- **Banco**: Supabase (PostgreSQL)
- **Deploy**: Vercel
- **Auth**: HMAC tokens custom + Google OAuth

## Desenvolvimento

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # type-check + produção
```

## Documentação

- `AGENTS.md` — Instruções para IA, últimas alterações, próximos passos
- `SETUP.md` — Setup completo, variáveis de ambiente, deploy
- `docs/CHANGELOG.md` — Histórico completo de alterações
- `.project-rules.md` — Regras de negócio (Whist, pontuação, categorias)
