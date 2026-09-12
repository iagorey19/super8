# Checklist — Placar e Ranking (financeiro do torneio = pontos)

- [ ] `upcoming` → "Abrir Inscrições" → `registering` → "Iniciar Torneio" → `ongoing` → encerrar → `completed`
- [ ] Inscrição pública só aparece em `/eventos/[id]` quando `registering`
- [ ] 9ª inscrição na categoria → `is_waiting:true` + `registration_order`; aprovar/rejeitar promove a fila
- [ ] Placar ao vivo atualiza ≤10s no admin; público ≤30s
- [ ] Partida trava em `max_score` (sem tiebreak: diferença de 1 game decide)
- [ ] Ranking ordena por `total_games` (desempate: saldo → confronto direto) + coluna Saldo e selo visíveis
- [ ] Torneio `completed` trava placar (`locked`); toggle manual 🔒/🔓 funciona
- [ ] Ranking anual normaliza `games * 5 / max_score`
- [ ] Exportar grade (texto/CSV/PDF) confere com a tela
- [ ] Após torneio completo: seed atualizado (regra bug-001)
