# API Design — BioHarvest MVP (/api/v1)

## Endpoint groups

| Method | URL | Purpose | Auth | Permission |
|---|---|---|---|---|
| POST | /auth/register | регистрация | нет | public |
| POST | /auth/login | логин, выдача access+refresh | нет | public |
| POST | /auth/refresh | обновление access token | refresh token | public (валидный refresh) |
| POST | /auth/logout | инвалидация refresh | access | authenticated |
| POST | /auth/password-reset/request | запрос сброса пароля | нет | public |
| POST | /auth/password-reset/confirm | подтверждение сброса | нет (token в body) | public |
| GET | /products/ | список товаров, фильтры/поиск/пагинация | нет | public |
| GET | /products/{slug}/ | детали товара | нет | public |
| GET | /categories/ | список категорий | нет | public |
| GET | /cart/ | текущая корзина | access | authenticated |
| POST | /cart/items/ | добавить товар | access | authenticated |
| PATCH | /cart/items/{id}/ | изменить qty | access | authenticated, owner |
| DELETE | /cart/items/{id}/ | удалить из корзины | access | authenticated, owner |
| POST | /orders/ | создать заказ (checkout) | access | authenticated, требует Idempotency-Key |
| GET | /orders/ | список своих заказов | access | authenticated, owner |
| GET | /orders/{id}/ | детали заказа | access | authenticated, owner или staff |
| POST | /orders/{id}/cancel/ | отмена заказа | access | authenticated, owner (пока не отгружен) |
| GET | /delivery/zones/ | зоны доставки | нет | public |
| GET | /health/ | health-check | нет | public |
| CRUD | /admin/products/, /admin/categories/, /admin/orders/, /admin/stock/, /admin/users/, /admin/delivery/, /admin/promocodes/ | админ-операции | access | STAFF/ADMIN, по разделам |
| GET | /admin/analytics/ | базовые метрики | access | ADMIN |
| GET | /admin/audit-log/ | журнал действий | access | ADMIN |

Для каждого эндпоинта в реализации (Phase 4+) фиксируются request/response
Pydantic-схемы и коды ошибок — здесь дан только контракт уровня "что есть".

## Error format

```json
{
  "error": {
    "code": "PRODUCT_OUT_OF_STOCK",
    "message": "Товара недостаточно на складе",
    "details": { "product_id": 42, "available": 0 }
  }
}
```

## Error codes (базовый набор)

`VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`,
`PRODUCT_NOT_FOUND`, `PRODUCT_OUT_OF_STOCK`, `INVALID_QUANTITY`,
`ORDER_NOT_FOUND`, `ORDER_ALREADY_CANCELLED`, `INVALID_PROMO_CODE`,
`PROMO_CODE_EXPIRED`, `IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD`,
`RATE_LIMITED`, `INTERNAL_ERROR`

## Idempotency

- `POST /orders/` требует заголовок `Idempotency-Key` (UUID от клиента).
- Ключ + user_id хранится в таблице (или как unique constraint на
  `orders.idempotency_key`) с TTL, например 24 часа.
- Повторный запрос с тем же ключом и тем же payload → возвращает уже
  созданный Order (200, не 201) без повторного списания стока.
- Тот же ключ, но другой payload → `409 IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD`.
- Payment webhook (когда появится реальный провайдер) — идемпотентность по
  `provider_transaction_id`, unique constraint на PaymentTransaction.
