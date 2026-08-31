# Roadmap — After MVP

Порядок ориентировочный, зависит от реальной обратной связи после запуска MVP.

1. **Reviews + moderation** — низкая сложность, повышает доверие покупателей.
2. **Wishlist** — низкая сложность.
3. **Real payment provider** — реализация конкретного класса `PaymentProvider`
   (см. ADR-008) для локального Kyrgyz-провайдера, webhook + idempotency.
4. **Fertilizer calculator** — детерминированная формула на backend, без AI.
5. **B2B**: Company, CompanyMember, wholesale pricing, bulk orders —
   требует отдельного review прав доступа (member роли внутри компании).
6. **Rule-based recommendation engine**: Culture, GrowthStage, Problem,
   ApplicationMethod — сначала explainable rule-based, ML/AI — отдельная фаза
   после накопления данных.
7. **Blog/Articles/SEO** — sitemap, robots, Open Graph, structured data.
8. **Продвинутая Analytics** — когорты, LTV, top products по периодам.
9. **AI/ML рекомендации** — только после того, как rule-based engine
   накопит достаточно данных о реальных заказах/культурах.

Ни одна из этих фич не должна требовать переписывания MVP-ядра (auth,
каталог, заказы, сток) — если в процессе реализации выяснится, что требует,
это сигнал вернуться и пересмотреть ADR/архитектуру, а не "подгонять" поверх.
