from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category import Category
from app.models.product import Product

class CategoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> list[Category]:
        result = await self.db.execute(select(Category))
        return list(result.scalars().all())

    async def get_by_id(self, category_id: int) -> Category | None:
        return await self.db.get(Category, category_id)

    async def create(self, data: dict) -> Category:
        category = Category(**data)
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def update(self, category: Category, data: dict) -> Category:
        for key, value in data.items():
            setattr(category, key, value)
        await self.db.flush()
        await self.db.refresh(category)
        return category

    async def has_products(self, category_id: int) -> bool:
        result = await self.db.execute(
            select(Product.id).where(Product.category_id == category_id).limit(1)
        )
        return result.scalar_one_or_none() is not None

    async def delete(self, category: Category) -> None:
        await self.db.delete(category)
        await self.db.flush()
