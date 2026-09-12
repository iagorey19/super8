# bug-001 — Seed desatualizado → reset apagou 28 matches do T3

## Bug
Após reset do Supabase, o 3º torneio (T3) voltou **só com inscrições** — 28 matches + 16 results perdidos permanentemente.

## Causa
O `seed.ts` foi escrito quando o T3 estava `upcoming` (só tinha inscrições, sem jogos).
Os matches do T3 foram inseridos **via app**, nunca replicados no seed.
O reset recriou o banco a partir do seed → tudo que só existia no banco foi embora.

## Impacto
| Torneio | Regs | Pairs | Matches | Results | Status |
|---------|------|-------|---------|---------|--------|
| T1 | 16 | 28 | 28 | 16 | ✅ Completo |
| T2 | 8 | 14 | 14 | 8 | ✅ Completo |
| T3 | 16 | 0 | 0 | 0 | ⚠️ Só inscrições (irrecuperável) |
| T4 | 16 | 28 | 28 | 16 | ✅ Completo |

## Solução
- 16 inscrições do T3 reinseridas a partir dos dados recuperados do seed.
- Jogos do T3 declarados irrecuperáveis (não constar no ranking anual como completos).

## Prevenção (regra permanente)
1. **Seed é snapshot**: após CADA torneio completo, inserir pairings + matches + results no `seed.ts` e bump de versão.
2. **Backup obrigatório antes de qualquer operação destrutiva**:
   ```bash
   supabase db dump --linked > debug/dumps/backup-YYYYMMDD.sql
   ```
3. Nunca assumir que "dado inserido via app está no seed" — verificar.
4. Ver regra adaptada em `docs/padroes/05-supabase.md` (seção Seed).
