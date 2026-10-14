from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.fertilizer_repository import FertilizerRepository
from app.schemas.fertilizer import (
    CropOut, FertilizerNormOut, FertilizerCalculateIn,
    FertilizerCalculationOut, FertilizerCalculationItemOut,
)

router = APIRouter(prefix="/fertilizer", tags=["fertilizer"])

@router.get("/crops", response_model=list[CropOut])
async def list_crops(db: AsyncSession = Depends(get_db)):
    return await FertilizerRepository(db).list_crops()

@router.get("/crops/{crop_id}/norms", response_model=list[FertilizerNormOut])
async def list_norms(crop_id: int, db: AsyncSession = Depends(get_db)):
    repo = FertilizerRepository(db)
    await repo.get_crop(crop_id)  # 404, если культуры нет
    return await repo.get_norms_for_crop(crop_id)

@router.post("/calculate", response_model=FertilizerCalculationOut)
async def calculate(data: FertilizerCalculateIn, db: AsyncSession = Depends(get_db)):
    repo = FertilizerRepository(db)
    crop = await repo.get_crop(data.crop_id)
    area_sotka = repo.area_to_sotka(data.area, data.area_unit)
    norms = await repo.get_norms_for_crop(data.crop_id)

    items = [
        FertilizerCalculationItemOut(
            fertilizer_name=norm.fertilizer_name,
            stage=norm.stage,
            note=norm.note,
            amount_kg=round(float(norm.dosage_per_sotka_kg) * area_sotka, 3),
            recommended_product=norm.recommended_product,
        )
        for norm in norms
    ]

    return FertilizerCalculationOut(crop=crop, area_sotka=area_sotka, items=items)