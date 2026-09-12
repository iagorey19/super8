# debug/ — Pasta de diagnóstico (guia 26, Dia 0)

Estrutura obrigatória. Versionar só `README.md`, `scripts/` e `tests-manuais/`.
`logs/`, `dumps/` e `fixes/` são **gitignorados** (ver `.gitignore`).

```
debug/
├── README.md              # este arquivo
├── scripts/               # scripts versionados
│   ├── check-env.ps1        # .env.local tem todas as chaves? (só nomes, nunca valores)
│   ├── check-build.ps1      # tsc + build (BLOCKER pré-commit)
│   ├── check-routes.ps1     # rotas respondem 200?
│   ├── check-processos.ps1  # node.exe órfãos / RAM
│   ├── check-supabase.ps1   # migrations + link do projeto
│   └── consultar-licoes.ps1 # consulta o acervo 20-licoes-aprendidas/
├── logs/                  # runtime (gitignorado)
├── dumps/                 # backups .sql antes de reset (gitignorado)
├── tests-manuais/         # checklists versionados
└── fixes/                 # rascunhos de correção (gitignorado)
```

## Debug ao vivo (já implementado no app)

| Peça | Onde |
|------|------|
| Logger client (`window.onerror` + `unhandledrejection` → `POST /api/logs`) | `src/lib/logger.ts` + `src/components/error-logger.tsx` |
| Ingestão de logs (rate limit 60/min, sem segredos) | `src/app/api/logs/route.ts` |
| Logger server (pino; arquivo só em dev, stdout em prod/Vercel) | `src/lib/server-logger.ts` |
| Diagnóstico poll (`GET /api/debug/all`) | `src/app/api/debug/all/route.ts` |
| Version check (recarrega se `version.json` mudou) | `src/components/version-check.tsx` + `public/version.json` |

## Acervo de lições

Antes de corrigir qualquer bug: `.\debug\scripts\consultar-licoes.ps1 -Termo "seed"`.
Acervo local: `20-licoes-aprendidas/`.
