# Checklist — Deploy

- [ ] `npx tsc --noEmit` zero erros
- [ ] `npm run build` zero erros (+ `public/version.json` regenerado)
- [ ] `git push` → Vercel deploy termina em Ready (~1-2 min)
- [ ] Home HTTP 200 (`.\debug\scripts\check-routes.ps1 -BaseUrl <url>`)
- [ ] `/auth/login` renderiza form; login/logout funciona em produção
- [ ] `/eventos` lista torneios; `/eventos/[id]` abre quando `registering`
- [ ] Console do navegador sem erros
- [ ] `GET /api/debug/all` → `ok:true` + flags de env todas `true`
- [ ] Abrir em 2 abas, publicar deploy novo → `<VersionCheck />` recarrega sem hard refresh
- [ ] Registrar resultado no Status Atual (`AGENTS.md`)
