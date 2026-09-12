# Checklist — Placar e Ranking (financeiro do torneio = pontos)

- [ ] `upcoming` → "Abrir Inscrições" → `registering` → "Iniciar Torneio" → `ongoing` → encerrar → `completed`
- [ ] Inscrição pública só aparece em `/eventos/[id]` quando `registering`
- [ ] 9ª inscrição na categoria → `is_waiting:true` + `registration_order`; aprovar/rejeitar promove a fila
- [ ] Placar ao vivo atualiza ≤10s no admin; público ≤30s
- [ ] Partida trava em `max_score`; tiebreak em `max_score-1 × max_score-1` vence por 2
- [ ] Ranking ordena por `total_games` (desempate: confronto direto)
- [ ] Torneio `completed` trava placar (`locked`); toggle manual 🔒/🔓 funciona
- [ ] Ranking anual normaliza `games * 5 / max_score`
- [ ] Exportar grade (texto/CSV/PDF) confere com a tela
- [ ] Após torneio completo: seed atualizado (regra bug-001)
