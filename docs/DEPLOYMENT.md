# Deployment Architecture — BioHarvest MVP

## Топология

```
User → Cloudflare (DNS, SSL/TLS, WAF, CDN)
  ├─→ Cloudflare Pages/Workers → React static build (frontend)
  └─→ Render → FastAPI (Uvicorn/Gunicorn ASGI, backend) → Neon PostgreSQL
```

## Docker (local dev)

`docker-compose.yml`:
- `backend` — FastAPI, hot-reload в dev, порт 8000
- `db` — PostgreSQL (локальный, не Neon, для offline-разработки)
- `redis` — **только если появится реальная необходимость** (сейчас не включаем)
- `frontend` — Vite dev server, порт 5173

Production: backend НЕ запускается через docker-compose на Render (Render
собирает по Dockerfile напрямую), локальная БД не используется —
`DATABASE_URL` указывает на Neon production/staging.

## CI/CD (GitHub Actions)

Ветки: `main` (production), `develop`, `feature/*`.

Pipeline на каждый PR:
1. lint (ruff/eslint)
2. typecheck (mypy/tsc)
3. tests (pytest, vitest)
4. build (docker build backend, vite build frontend)

Деплой на production запускается только из `main` после прохождения всех
шагов — merge в `main` триггерит Render/Cloudflare деплой.

## Cloudflare

- DNS + SSL/TLS (Full Strict между Cloudflare и Render)
- WAF: базовые managed rules + rate limiting rules на `/auth/*`, `/orders`
- CDN для статики фронтенда
- Frontend раздаётся через Cloudflare Pages

## Render

- FastAPI production service, ASGI-сервер (uvicorn workers)
- Environment variables через Render dashboard/secrets
- `GET /health/` как health check endpoint для Render
- Auto-deploy на push в `main` после прохождения CI
- Логи — через Render logs, интеграция с Sentry для error tracking

## Neon

- Отдельные ветки БД: production и staging (Neon branching)
- Connection pooling (Neon pooler) — обязателен, т.к. serverless Postgres
- SSL required по умолчанию
- Миграции — Alembic, применяются в CI/CD как отдельный шаг перед деплоем
- Backup: Neon point-in-time restore — задокументировать процедуру restore
  (какая команда/UI, кто может её выполнить)

## .env.example (ключи, без значений)

```
APP_ENV=
DEBUG=
SECRET_KEY=
DATABASE_URL=
JWT_SECRET=
JWT_ACCESS_TTL_MIN=
JWT_REFRESH_TTL_DAYS=
CORS_ORIGINS=
FRONTEND_URL=
SENTRY_DSN=
# REDIS_URL=   # только если понадобится
```
