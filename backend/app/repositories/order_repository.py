from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.order_status_history import OrderStatusHistory

class OrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_idempotency_key(self, key: str) -> Order | None:
        result = await self.db.execute(
            select(Order).where(Order.idempotency_key == key).options(selectinload(Order.items))
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, order_id: int) -> Order | None:
        result = await self.db.execute(
            select(Order).where(Order.id == order_id).options(selectinload(Order.items))
        )
        return result.scalar_one_or_none()

    async def get_all_for_user(self, user_id: int) -> list[Order]:
        result = await self.db.execute(
            select(Order).where(Order.user_id == user_id).options(selectinload(Order.items))
        )
        return list(result.scalars().all())

    async def create_with_items(
        self, user_id: int, idempotency_key: str, subtotal: float, total: float, items_data: list[dict]
    ) -> Order:
        order = Order(
            user_id=user_id,
            idempotency_key=idempotency_key,
            subtotal=subtotal,
            total=total,
        )
        order.items = [OrderItem(**data) for data in items_data]
        self.db.add(order)
        await self.db.flush()  # получаем order.id ДО коммита — нужен для OrderStatusHistory

        history = OrderStatusHistory(order_id=order.id, status="CREATED")
        self.db.add(history)

        await self.db.commit()
        await self.db.refresh(order, attribute_names=["items"])
        return order