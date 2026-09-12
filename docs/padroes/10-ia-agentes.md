# 10 — IA e Agentes (não se aplica — registrado para consulta futura)

O super8 **não tem** IA, OCR, LLM, chatbot nem bot de Telegram/WhatsApp hoje.
Se um dia tiver, as regras a adaptar são:

- Arquitetura dual: OCR (imagem→texto) → LLM (texto→JSON). Confiança mínima OCR >0.7, fallback manual, imagem máx. 5MB (jpg/png/webp).
- Keys: nunca no bundle sem ofuscação; validar formato; backend faz a chamada.
- Kill switch (`is_active`) + delay configurável + prompt editável via admin.
- RLS nas tabelas de IA por tenant/role; hooks dedicados; Realtime com fallback.
- Bot de Telegram (se houver): **polling, nunca webhook local**; allowlist de chats;
  confirmação p/ escrita; `sanitizeToken` em logs; health check dedicado.

Nada acima deve ser implementado "por precaução" — só se uma feature real pedir.
