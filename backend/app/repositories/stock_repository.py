from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.stock import Stock

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