# PROJECT_PLAN — BioHarvest

## Статус
Репозиторий на старте пустой — архитектура спроектирована с нуля.

## Phase 0 — Architecture & System Design ✅ (этот коммит)
Готово: ARCHITECTURE.md, DATABASE_DESIGN.md (+ERD), API_DESIGN.md,
SECURITY.md, THREAT_MODEL.md, DEPLOYMENT.md, MVP_SCOPE.md, ROADMAP.md,
adr/ADR-001..008.md, этот PROJECT_PLAN.md.

Production-код НЕ писался — по требованию Phase 0.

## Найденные риски (architecture review)
1. Async SQLAlchemy 2.x требует дисциплины (AsyncSession везде) — легко
   случайно смешать sync/async и получить блокирующий вызов в event loop.
2. Собственный Admin UI (нет Django admin) — это реальный кусок работы
   (Phase про admin), нельзя недооценивать его объём относительно "обычного" MVP.
3. Idempotency-Key и row-locking на stock — некритично сложны сами по себе,
   но требуют тестов на конкурентность (Phase 6), которые легко пропустить.
4. JWT refresh-ротация на фронте — источник тонких багов (race condition
   при параллельных 401), нужен явный тест на это в Phase 13/15.
5. Соблазн начать добавлять Future-модели (B2B, calculator) "заодно" —
   явно исключено в MVP_SCOPE.md, отслеживать в code review.

## Следующая фаза — Phase 1: Backend Foundation
- Инициализация FastAPI-приложения: `app/core/config.py` (Pydantic Settings),
  `app/db/session.py` (async engine + session factory), Alembic init.
- `docker-compose.yml`: backend + local Postgres.
- `GET /health/` эндпоинт.
- Базовое логирование и error handler (единый формат ошибок из API_DESIGN.md).
- Smoke test: приложение стартует локально и в Docker, health отвечает 200.

**Ждём ревью Phase 0 перед стартом Phase 1.**
