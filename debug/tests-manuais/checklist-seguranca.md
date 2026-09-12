# Checklist — Segurança

- [ ] `git ls-files | findstr .env` → só `.env.example` (nenhum `.env.local` commitado)
- [ ] `grep -r "service_role\|AUTH_TOKEN_SECRET\|EXEC_SQL_SECRET" src/ --include=*.tsx` → nada em código client
- [ ] Login como atleta → `GET /api/data` não expõe `email/phone` de outros usuários
- [ ] POST `/api/data` com payload inválido → 400 (Zod)
- [ ] Upload de arquivo não-imagem ou >20MB → rejeitado
- [ ] RLS ativa em todas as tabelas (conferir no Supabase → Table Editor / `get_advisors`)
- [ ] Rate limit: 6 logins rápidos → 429; POSTs em rajada → 429
- [ ] Headers em produção: `nosniff`, `DENY`, `XSS`, `Referrer-Policy`, `Permissions-Policy`
- [ ] URLs de patrocinador/foto com `javascript:` → sanitizadas
