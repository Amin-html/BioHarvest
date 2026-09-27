from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product

class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> list[Product]:
        result = await self.db.execute(select(Product).options(selectinload(Product.images)))
        return list(result.scalars().all())

    async def create(self, data: dict) -> Product:
        product = Product(**data)
        self.db.add(product)
        await self.db.commit()
        await self.db.refresh(product, attribute_names=["images"])
        return product

    async def get_by_id(self, product_id: int) -> Product | None:
        result = await self.db.execute(
            select(Product).where(Product.id == product_id).options(selectinload(Product.images))
        )
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Product | None:
        result = await self.db.execute(
            select(Product).where(Product.slug == slug).options(selectinload(Product.images))
        )
        return result.scalar_one_or_none()

    async def update(self, product: Product, data: dict) -> Product:
        for key, value in data.items():
            setattr(product, key, value)
        await self.db.flush()
        await self.db.refresh(product, attribute_names=["images"])
        return product

    async def soft_delete(self, product: Product) -> None:
        product.is_active = False
        await self.db.flush()