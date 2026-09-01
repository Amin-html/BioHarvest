from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product

class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> list[Product]:
        result = await self.db.execute(select(Product))
        return list(result.scalars().all())