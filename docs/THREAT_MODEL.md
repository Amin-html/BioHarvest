# Threat Model — BioHarvest MVP

| Threat | Impact | Likelihood | Mitigation |
|---|---|---|---|
| SQL injection | High | Low | SQLAlchemy parametrized queries, no raw SQL string concat |
| XSS | Medium | Medium | React auto-escaping, CSP header, access token не в localStorage |
| CSRF | Medium | Low | SameSite=Strict cookie для refresh, access token в памяти |
| Credential stuffing / brute force | Medium | Medium | rate limiting на /auth/login, account lockout после N попыток |
| IDOR (доступ к чужому заказу/корзине по id) | High | Medium | owner-check в service на каждый GET/PATCH/DELETE по id |
| Privilege escalation (customer→admin) | High | Low | роль не принимается из клиентского payload; смена роли только через отдельный admin-эндпоинт с audit log |
| Overselling (race condition на stock) | High | Medium | row-level lock (SELECT FOR UPDATE) при резервировании, см. DATABASE_DESIGN.md |
| Duplicate order (double submit) | Medium | Medium | Idempotency-Key на POST /orders |
| Duplicate payment | High | Low (MVP=COD) | unique constraint на provider_transaction_id, когда появится провайдер |
| Malicious file upload | Medium | Low | MIME-проверка по содержимому, лимит размера, safe filename, изоляция storage |
| Secret leakage (в Git/логах) | High | Low | .env в .gitignore, secret scanning в CI, запрет логирования секретов |
| DDoS | Medium | Low | Cloudflare WAF/DDoS protection перед Render |
| Rate/API abuse (scraping каталога) | Low | Medium | rate limiting per-IP на публичных GET-эндпоинтах |
| Промо-код abuse (превышение max_uses под нагрузкой) | Low | Low | used_count инкрементируется в той же транзакции, что и Order, с проверкой constraint |
