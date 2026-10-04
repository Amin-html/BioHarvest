from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.stock import Stock
from app.models.user import User, UserRole

class DashboardRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def total_revenue(self) -> float:
        result = await self.db.execute(
            select(func.coalesce(func.sum(Order.total), 0)).where(Order.status != OrderStatus.CANCELLED)
        )
        return float(result.scalar())

    async def total_orders(self) -> int:
        result = await self.db.execute(select(func.count(Order.id)))
        return int(result.scalar())

    async def total_customers(self) -> int:
        result = await self.db.execute(select(func.count(User.id)).where(User.role == UserRole.CUSTOMER))
        return int(result.scalar())

    async def orders_by_status(self) -> list[tuple[str, int]]:
        result = await self.db.execute(
            select(Order.status, func.count(Order.id)).group_by(Order.status)
        )
        return [(status.value, count) for status, count in result.all()]

    async def revenue_last_30_days(self) -> list[tuple[str, float]]:
        since = datetime.now(timezone.utc) - timedelta(days=30)
        result = await self.db.execute(
            select(func.date(Order.created_at), func.sum(Order.total))
            .where(Order.status != OrderStatus.CANCELLED, Order.created_at >= since)
            .group_by(func.date(Order.created_at))
            .order_by(func.date(Order.created_at))
        )
        return [(str(d), float(revenue)) for d, revenue in result.all()]

    async def top_products(self, limit: int = 5) -> list[tuple[int, str, int, float]]:
        result = await self.db.execute(
            select(
                OrderItem.product_id,
                Product.name,
                func.sum(OrderItem.quantity),
                func.sum(OrderItem.line_total),
            )
            .join(Order, Order.id == OrderItem.order_id)
            .join(Product, Product.id == OrderItem.product_id)
            .where(Order.status != OrderStatus.CANCELLED)
            .group_by(OrderItem.product_id, Product.name)
            .order_by(func.sum(OrderItem.line_total).desc())
            .limit(limit)
        )
        return [(pid, name, int(qty), float(rev)) for pid, name, qty, rev in result.all()]

    async def low_stock(self, threshold: int = 10) -> list[tuple[int, str, int]]:
        available = Stock.current_stock - Stock.reserved_stock
        result = await self.db.execute(
            select(Stock.product_id, Product.name, available)
            .join(Product, Product.id == Stock.product_id)
            .where(available <= threshold)
            .order_by(available.asc())
        )
        return [(pid, name, int(avail)) for pid, name, avail in result.all()]
