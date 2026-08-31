# MVP Scope — BioHarvest

## Принцип
MVP должен доказать, что ядро торговой платформы работает надёжно
(каталог → корзина → заказ → склад), а не покрыть все фичи агроплатформы.
Всё, что не критично для этого пути — выносится в Future.

## MVP (входит в Phase 1–17 реализации)
- Authentication: регистрация, логин, refresh, logout, password reset (архитектура)
- Users: CUSTOMER / STAFF / ADMIN роли
- Catalog: Category, Product, ProductImage, ProductVariant
- Search, filtering, sorting, pagination
- Cart, CartItem
- Checkout → Order, OrderItem, OrderStatusHistory
- Stock: current/reserved/available, race-condition-safe reservation
- Delivery: DeliveryZone, DeliveryMethod, pickup/courier/regional
- PromoCode (базовый, без сложных правил комбинирования)
- Admin UI: Products, Categories, Orders, Stock, Users, Delivery, Promo, базовая Analytics
- Notification (email/order status, минимально)
- AuditLog для admin-действий
- Security baseline: CORS allowlist, rate limiting, security headers, secrets via env
- Observability: /health, structured logging
- Docker + CI (lint/typecheck/test/build) + деплой на Render/Cloudflare/Neon

## Явно вне MVP (Future)
- B2B: Company, CompanyMember, wholesale pricing, bulk orders
- Fertilizer calculator
- Rule-based recommendation engine (Culture, GrowthStage, Problem, ApplicationMethod)
- Wishlist
- Reviews + moderation
- Blog/Articles/SEO
- Продвинутая Analytics (когортный анализ, LTV и т.д.)
- Реальный online-payment provider (MVP = Cash on Delivery через PaymentProvider abstraction)
- AI/ML-рекомендации

## Почему так
Каждая future-фича добавляет модели, эндпоинты, admin-разделы и
security-поверхность. Если попытаться сделать всё сразу — ни одна
часть не будет доведена до production-качества. Архитектура (repository
layer, service layer, PaymentProvider abstraction) специально спроектирована
так, чтобы future-фичи добавлялись без переписывания MVP-ядра.
