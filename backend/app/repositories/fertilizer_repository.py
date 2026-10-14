from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.crop import Crop
from app.models.fertilizer_norm import FertilizerNorm
from app.models.product import Product

# 1 гектар = 100 соток = 10000 м²
AREA_TO_SOTKA = {
    "sotka": 1.0,
    "hectare": 100.0,
    "m2": 0.01,
}

class FertilizerRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_crops(self) -> list[Crop]:
        result = await self.db.execute(select(Crop).order_by(Crop.name))
        return list(result.scalars().all())

    async def get_crop(self, crop_id: int) -> Crop:
        crop = await self.db.get(Crop, crop_id)
        if crop is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Crop not found")
        return crop

    async def get_norms_for_crop(self, crop_id: int) -> list[FertilizerNorm]:
        result = await self.db.execute(
            select(FertilizerNorm)
            .where(FertilizerNorm.crop_id == crop_id)
            .options(
                selectinload(FertilizerNorm.recommended_product).selectinload(Product.images)
            )
            .order_by(FertilizerNorm.id)
        )
        return list(result.scalars().all())

    @staticmethod
    def area_to_sotka(area: float, area_unit: str) -> float:
        if area_unit not in AREA_TO_SOTKA:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unknown area_unit")
        return area * AREA_TO_SOTKA[area_unit]