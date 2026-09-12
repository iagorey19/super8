# Checklist — Login e Auth

- [ ] Login admin (`admin@super8.com`) entra e vê dashboard admin
- [ ] Login atleta entra e vê área da atleta
- [ ] Senha errada → mensagem amigável, sem detalhe técnico
- [ ] 6 tentativas rápidas → rate limit (5/min) responde 429
- [ ] "Entrar com Google" → callback cria/busca user → cookie setado → handler salva sessionStorage
- [ ] `?next=/admin` válido redireciona; `?next=https://evil.com` é bloqueado (open redirect)
- [ ] Forgot password → email chega → OTP válido reseta → Auth + `public.users` atualizados
- [ ] Logout limpa cookie + sessionStorage; rota protegida volta p/ login
- [ ] Cadastro com email existente → mensagem com nome do atleta existente
- [ ] Senha fraca (<6 ou sem maiúscula/minúscula/número) → erro claro
