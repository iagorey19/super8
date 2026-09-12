# 20 — Lições Aprendidas (acervo local — adaptado do template 20)

> Fluxo obrigatório (BLOCKER): **1)** ANTES de corrigir → `.\debug\scripts\consultar-licoes.ps1 -Termo "<assunto>"`
> **2)** AO corrigir → documentar Bug→Causa→Impacto→Solução→Prevenção em `bug-XXX/` com `antes/` e `depois/`
> **3)** ONDE corrigir → antes de reset, migration, deploy ou refactor, consultar o acervo.

## Índice

| Bug | Título | Status |
|-----|--------|--------|
| [bug-001](bug-001-seed-snapshot/) | Seed desatualizado → reset apagou 28 matches do T3 | Documentado, dados irrecuperáveis |

## Template para novo bug

```
20-licoes-aprendidas/bug-XXX-nome-curto/
├── README.md      # Bug → Causa → Impacto → Solução → Prevenção
├── antes/         # trecho/cópia do código ou estado que causou o bug
└── depois/        # trecho/cópia do código corrigido
```
