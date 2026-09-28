from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product

SORT_OPTIONS = {
    "price_asc": Product.price.asc(),
    "price_desc": Product.price.desc(),
    "name_asc": Product.name.asc(),
    "newest": Product.id.desc(),
}

class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> list[Product]:
        result = await self.db.execute(select(Product).options(selectinload(Product.images)))
        return list(result.scalars().all())

    async def search(
        self,
        *,
        q: str | None,
        category_id: int | None,
        min_price: float | None,
        max_price: float | None,
        sort: str | None,
        page: int,
        page_size: int,
    ) -> tuple[list[Product], int]:
        # Публичный поиск — только активные товары.
        conditions = [Product.is_active == True]  # noqa: E712
        if q:
            escaped = q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            conditions.append(Product.name.ilike(f"%{escaped}%", escape="\\"))
        if category_id is not None:
            conditions.append(Product.category_id == category_id)
        if min_price is not None:
            conditions.append(Product.price >= min_price)
        if max_price is not None:
            conditions.append(Product.price <= max_price)

        count_query = select(func.count()).select_from(Product).where(*conditions)
        total = (await self.db.execute(count_query)).scalar_one()

        query = (
            select(Product)
            .where(*conditions)
            .options(selectinload(Product.images))
            .order_by(SORT_OPTIONS.get(sort, Product.id.desc()))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all()), total

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