# Security Architecture — BioHarvest MVP

## Layers

```
Cloudflare (WAF, DDoS, TLS termination, CDN)
  → HTTPS only
  → FastAPI middleware: request-id, CORS allowlist, rate limiting
  → Authentication (JWT dependency)
  → Authorization (per-endpoint permission check in service)
  → Pydantic validation (input)
  → Repository (parametrized queries — SQLAlchemy защищает от SQL injection по умолчанию)
  → PostgreSQL (least-privilege DB user, SSL required — Neon даёт по умолчанию)
```

## Authentication — JWT vs session, сравнение

| | JWT (access+refresh) | Server session/cookie |
|---|---|---|
| SPA + отдельный backend домен | просто, не требует shared session store | нужен shared store (Redis) при нескольких инстансах, сложнее с cross-domain cookies |
| CSRF | не подвержен CSRF (если хранить access в памяти, не в cookie) | требует CSRF-токена |
| XSS | если хранить в localStorage — уязвим к XSS-краже токена | httpOnly cookie не читается из JS — safer от XSS |
| Logout / revocation | нужен отдельный blacklist/refresh-rotation | тривиален (удалить сессию) |
| Масштабирование backend (Render — несколько инстансов) | stateless, легко | нужен shared store |

**Решение**: JWT access token (короткий TTL, 15 мин) в памяти на фронте
(не localStorage) + refresh token в httpOnly Secure SameSite=Strict cookie
с ротацией (каждый refresh выдаёт новый refresh, старый инвалидируется).
Это даёт stateless масштабирование backend на Render и не подвержено ни
классическому CSRF (refresh cookie не читается JS, но и не отправляется
кросс-доменно с SameSite=Strict), ни XSS-краже access token из localStorage.
Logout — инвалидация refresh-записи в БД (короткая таблица `refresh_tokens`
с hash токена, не сам токен).

Password hashing: bcrypt/argon2 (не MD5/SHA напрямую).
Password reset: одноразовый токен с TTL 15–30 мин, hash токена в БД, не сам токен.

## Authorization / RBAC

Роли: CUSTOMER, STAFF, ADMIN.
- Permission-проверка — в service layer, а не только в router-декораторе,
  потому что часто нужен контекст (например "owner ИЛИ staff").
- Privilege escalation защита: роль пользователя **никогда** не берётся из
  request body при регистрации/обновлении профиля — только ADMIN-эндпоинт
  может менять чужую роль, и он логируется в AuditLog.
- Все `/admin/*` эндпоинты требуют STAFF/ADMIN на уровне dependency,
  плюс more fine-grained проверки внутри (например STAFF не может менять роли).

## Прочее

- CORS: явный allowlist доменов (`FRONTEND_URL`), никогда `allow_origins=["*"]` в production.
- Rate limiting: на `/auth/login`, `/auth/register`, `/orders/`, admin endpoints —
  по IP + по user_id где применимо (защита от brute force и abuse).
- Security headers: CSP, X-Content-Type-Options: nosniff, Referrer-Policy,
  Permissions-Policy, HSTS (включить после проверки, что весь трафик на HTTPS).
- File upload (product images): проверка MIME по содержимому (не только
  расширению), лимит размера, случайное безопасное имя файла, хранение
  вне выполняемых путей (см. FILE_STORAGE — Cloudflare R2 в Future, локально в MVP-dev).
- Logging: никогда не логировать password, токены, номера карт; PII —
  минимально, с ограниченным retention.
- Secrets: только через environment variables/Render secret storage, `.env`
  в `.gitignore`, `.env.example` без реальных значений.
