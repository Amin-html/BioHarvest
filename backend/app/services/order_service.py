import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.repositories.cart_repository import CartRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.stock_repository import StockRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.delivery_repository import DeliveryRepository

class OrderService:
    def __init__(
        self,
        cart_repo: CartRepository,
        product_repo: ProductRepository,
        stock_repo: StockRepository,
        order_repo: OrderRepository,
        delivery_repo: DeliveryRepository,
    ):
        self.cart_repo = cart_repo
        self.product_repo = product_repo
        self.stock_repo = stock_repo
        self.order_repo = order_repo
        self.delivery_repo = delivery_repo

    async def checkout(self, user_id: int, idempotency_key: str, delivery_method_id: int | None = None):
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

        for item in cart.items:
            await self.stock_repo.reserve(item.product_id, item.quantity)

        order = await self.order_repo.create_with_items(
            user_id=user_id,
            idempotency_key=idempotency_key,
            subtotal=subtotal,
            total=subtotal + delivery_price,
            delivery_method_id=delivery_method_id,
            delivery_price=delivery_price,
            items_data=order_items_data,
        )

        await self.cart_repo.clear(cart.id)

        return order