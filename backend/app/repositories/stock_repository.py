from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from app.models.stock import Stock
from app.models.product import Product

class StockRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def reserve(self, product_id: int, quantity: int) -> None:
        # SELECT ... FOR UPDATE — блокирует строку до конца транзакции.
        # Второй параллельный запрос на этот же product_id будет ЖДАТЬ здесь,
        # пока первая транзакция не закоммитится или не откатится.
        result = await self.db.execute(
            select(Stock).where(Stock.product_id == product_id).with_for_update()
        )
        stock = result.scalar_one_or_none()
        if stock is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Stock not found for product")

        available = stock.current_stock - stock.reserved_stock
        if available < quantity:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"PRODUCT_OUT_OF_STOCK: available={available}, requested={quantity}",
            )
        stock.reserved_stock += quantity
        # commit делает вызывающий код (order_service) — резерв должен закоммититься
        # в той же транзакции, что и сам Order, иначе будет рассинхрон при сбое

    async def release(self, product_id: int, quantity: int) -> None:
        result = await self.db.execute(
            select(Stock).where(Stock.product_id == product_id).with_for_update()
        )
        stock = result.scalar_one_or_none()
        if stock is None:
            return
        stock.reserved_stock = max(0, stock.reserved_stock - quantity)

    async def get_by_product_id(self, product_id: int) -> Stock | None:
        result = await self.db.execute(select(Stock).where(Stock.product_id == product_id))
        return result.scalar_one_or_none()

    async def create(self, product_id: int, current_stock: int) -> Stock:
        product_check = await self.db.get(Product, product_id)
        if product_check is None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "PRODUCT_NOT_FOUND")

        existing = await self.get_by_product_id(product_id)
        if existing is not None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Stock already exists for this product")

        stock = Stock(product_id=product_id, current_stock=current_stock, reserved_stock=0)
        self.db.add(stock)
        await self.db.commit()
        await self.db.refresh(stock)
        return stock

    async def adjust(self, product_id: int, quantity: int) -> Stock:
        # тот же row-lock, что и в reserve() — пополнение склада тоже гонка,
        # если два админа одновременно правят один товар
        result = await self.db.execute(
            select(Stock).where(Stock.product_id == product_id).with_for_update()
        )
        stock = result.scalar_one_or_none()
        if stock is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Stock not found for product")

        new_value = stock.current_stock + quantity
        if new_value < stock.reserved_stock:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Cannot reduce stock below reserved amount ({stock.reserved_stock})",
            )
        stock.current_stock = new_value
        await self.db.commit()
        await self.db.refresh(stock)
        return stock