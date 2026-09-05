import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.repositories.cart_repository import CartRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.stock_repository import StockRepository
from app.repositories.order_repository import OrderRepository

class OrderService:
    def __init__(
        self,
        cart_repo: CartRepository,
        product_repo: ProductRepository,
        stock_repo: StockRepository,
        order_repo: OrderRepository,
    ):
        self.cart_repo = cart_repo
        self.product_repo = product_repo
        self.stock_repo = stock_repo
        self.order_repo = order_repo

    async def checkout(self, user_id: int, idempotency_key: str):
        # 1. Idempotency-check ПЕРВЫМ делом — до любой другой логики.
        existing = await self.order_repo.get_by_idempotency_key(idempotency_key)
        if existing:
            return existing  # повторный запрос — просто отдаём уже созданный заказ

        # 2. Берём корзину. Пустая корзина — ошибка, не заказ из воздуха.
        cart = await self.cart_repo.get_or_create_cart(user_id)
        if not cart.items:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cart is empty")

        # 3. КРИТИЧНО: цены берём из Product в БД ПРЯМО СЕЙЧАС,
        # а не из cart_item (там их вообще нет) и не с фронта.
        # Это и есть правило "frontend нельзя доверять price" из ARCHITECTURE.md.
        order_items_data = []
        subtotal = 0
        for item in cart.items:
            product = await self.product_repo.get_by_id(item.product_id)
            if product is None or not product.is_active:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    f"PRODUCT_NOT_FOUND: product_id={item.product_id}",
                )
            line_total = float(product.price) * item.quantity
            subtotal += line_total
            order_items_data.append({
                "product_id": product.id,
                "product_name_snapshot": product.name,
                "unit_price_snapshot": product.price,
                "quantity": item.quantity,
                "line_total": line_total,
            })

        # 4. Резервируем сток НА КАЖДЫЙ товар. Если хоть один не хватает —
        # исключение прервёт всё, а транзакция снаружи откатит уже сделанные резервы.
        for item in cart.items:
            await self.stock_repo.reserve(item.product_id, item.quantity)

        # 5. Создаём Order + OrderItem + первую запись статуса — одной транзакцией.
        order = await self.order_repo.create_with_items(
            user_id=user_id,
            idempotency_key=idempotency_key,
            subtotal=subtotal,
            total=subtotal,  # без доставки/промокода пока — total = subtotal
            items_data=order_items_data,
        )

        # 6. Корзина очищается ТОЛЬКО после успешного создания заказа.
        await self.cart_repo.clear(cart.id)

        return order