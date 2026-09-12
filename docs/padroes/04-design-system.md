# 04 — Design System (atalho)

Fonte canônica: **`DESIGN.md` na raiz** (tokens do Supabase). Este arquivo registra só as decisões
adaptadas para o super8 — não duplicar tokens aqui.

## Decisões
- Primária emerald `#3ecf8e`; botão verde com texto near-black `#171717` (nunca branco); radius 6px.
- Gradientes de marca: Dourado `#D4A843→#F5D77A`, Super8 `#1A237E→#0D47A1` (usar com parcimônia).
- Tipografia Inter: display weight 500 com tracking negativo; body 400; nunca display >500.
- Espaçamento base 8 (4/8/16/24/32/48); botões/inputs `rounded-sm` 6px; cards `rounded-xl`;
  `rounded-full` só para badges/avatar — nunca pill-button.
- Componentes: card `bg-card border rounded-xl shadow-sm hover:border-primary/50 p-4`;
  tabelas com header `bg-muted/50` e `hover:bg-muted/50` nas linhas; diálogos via Shadcn
  (`Dialog`/`AlertDialog`), nunca `window.confirm`.
- Mobile-first: grid 1 col mobile → 2 tablet → 3-4 desktop; sidebar vira drawer no mobile.
- Ao gerar UI: ler `DESIGN.md` + usar skill ui-ux-pro-max quando for criação relevante.
