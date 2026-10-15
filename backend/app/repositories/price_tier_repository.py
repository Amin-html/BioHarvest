from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product_price_tier import ProductPriceTier

class PriceTierRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_for_product(self, product_id: int) -> list[ProductPriceTier]:
        result = await self.db.execute(
            select(ProductPriceTier)
            .where(ProductPriceTier.product_id == product_id)
            .order_by(ProductPriceTier.min_quantity)
        )
        return list(result.scalars().all())

    async def get_owned(self, tier_id: int) -> ProductPriceTier:
        tier = await self.db.get(ProductPriceTier, tier_id)
        if tier is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Price tier not found")
        return tier

    async def create(self, product_id: int, data: dict) -> ProductPriceTier:
        tier = ProductPriceTier(product_id=product_id, **data)
        self.db.add(tier)
        try:
            await self.db.commit()
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Для этого количества уже есть цена (min_quantity должен быть уникален для товара)",
            )
        await self.db.refresh(tier)
        return tier

    async def update(self, tier_id: int, data: dict) -> ProductPriceTier:
        tier = await self.get_owned(tier_id)
        for key, value in data.items():
            setattr(tier, key, value)
        try:
            await self.db.commit()
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Для этого количества уже есть цена")
        await self.db.refresh(tier)
        return tier

    async def delete(self, tier_id: int) -> None:
        tier = await self.get_owned(tier_id)
        await self.db.delete(tier)
        await self.db.commit()

    async def get_effective_unit_price(self, product_id: int, quantity: int, fallback_price: float) -> float:
        """
        Возвращает цену за единицу для заданного количества: самый высокий
        min_quantity, который не превышает quantity. Если подходящего уровня
        нет (товар не участвует в опте, либо количество меньше минимального
        порога) — возвращается обычная розничная цена товара.
        """
        result = await self.db.execute(
            select(ProductPriceTier)
            .where(
                ProductPriceTier.product_id == product_id,
                ProductPriceTier.min_quantity <= quantity,
            )
            .order_by(ProductPriceTier.min_quantity.desc())
            .limit(1)
        )
        tier = result.scalar_one_or_none()
        return float(tier.unit_price) if tier is not None else fallback_price