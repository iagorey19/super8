# SETUP — THE SUPER 8

Sistema de gestão de torneios de padel no formato Whist (Americano).

## Pré-requisitos
- Node.js 18+ (`node --version`)
- Git (`git --version`)

## Instalação
```bash
cd super8
npm install
npm run dev
```
Acessar: `http://localhost:3000`

## Build de Produção
```bash
npm run build
```
Zero erros antes de qualquer commit/deploy.

## Dados
- **Arquivo JSON**: `data/super8-db.json` via API `/api/data`
- **Sessão**: `sessionStorage` (chave `super8-session`)
- **Seed**: Automático ao primeiro acesso sem dados salvos

### Reset manual
1. Deletar `data/super8-db.json` — recria seed na próxima requisição
2. `sessionStorage.removeItem('super8-session')` — desloga
3. Recarregar página

## Troubleshooting
- **Erro de TypeScript**: `npm run build` e corrigir erros
- **Dados corrompidos**: Reset manual acima
- **Porta ocupada**: Next.js tenta próxima porta disponível

## Login de Teste
Ver `AGENTS.md`.

---
_Atualizado em: 10/06/2026_
