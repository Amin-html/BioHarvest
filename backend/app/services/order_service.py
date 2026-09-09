import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.repositories.cart_repository import CartRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.stock_repository import StockRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.delivery_repository import DeliveryRepository
from app.repositories.promo_code_repository import PromoCodeRepository

class OrderService:
    def __init__(
        self,
        cart_repo: CartRepository,
        product_repo: ProductRepository,
        stock_repo: StockRepository,
        order_repo: OrderRepository,
        delivery_repo: DeliveryRepository,
        promo_repo: PromoCodeRepository,
    ):
        self.cart_repo = cart_repo
        self.product_repo = product_repo
        self.stock_repo = stock_repo
        self.order_repo = order_repo
        self.delivery_repo = delivery_repo
        self.promo_repo = promo_repo

    async def checkout(
            self,
            user_id: int,
            idempotency_key: str,
            delivery_method_id: int | None = None,
            promo_code: str | None = None,
    ):
        existing = await self.order_repo.get_by_idempotency_key(idempotency_key)
        if existing:
            return existing

        cart = await self.cart_repo.get_or_create_cart(user_id)
        if not cart.items:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cart is empty")

        delivery_price = 0.0
        if delivery_method_id is not None:
            method = await self.delivery_repo.get_method_by_id(delivery_method_id)
            if method is None:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid delivery method")
            delivery_price = float(method.price)

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

        # промокод считаем ПОСЛЕ полного subtotal, ДО резерва стока
        discount_total, promo_id = await self._validate_and_apply_promo(promo_code, subtotal)

        for item in cart.items:
            await self.stock_repo.reserve(item.product_id, item.quantity)

        order = await self.order_repo.create_with_items(
            user_id=user_id,
            idempotency_key=idempotency_key,
            subtotal=subtotal,
            total=subtotal - discount_total + delivery_price,
            delivery_method_id=delivery_method_id,
            delivery_price=delivery_price,
            promo_code_id=promo_id,
            discount_total=discount_total,
            items_data=order_items_data,
        )

        await self.cart_repo.clear(cart.id)

        return order

    async def cancel_order(self, user_id: int, order_id: int):
        order = await self.order_repo.get_by_id(order_id)
        if order is None or order.user_id != user_id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")

        if order.status in ("DELIVERED", "CANCELLED"):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Cannot cancel order in status {order.status}",
            )

        for item in order.items:
            await self.stock_repo.release(item.product_id, item.quantity)

        await self.order_repo.update_status(order, "CANCELLED")
        return order

    async def _validate_and_apply_promo(self, code: str | None, subtotal: float):
        if code is None:
            return 0.0, None

        promo = await self.promo_repo.get_for_update(code)
        now = datetime.now(timezone.utc)

        if promo is None or not promo.is_active:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "INVALID_PROMO_CODE")
        if not (promo.valid_from <= now <= promo.valid_to):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "PROMO_CODE_EXPIRED")
        if promo.used_count >= promo.max_uses:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "PROMO_CODE_EXPIRED")

        if promo.discount_type.value == "PERCENT":
            discount = subtotal * float(promo.value) / 100
        else:
            discount = float(promo.value)
        discount = min(discount, subtotal)  # скидка не может превышать сумму заказа

        await self.promo_repo.increment_usage(promo)
        return discount, promo.id