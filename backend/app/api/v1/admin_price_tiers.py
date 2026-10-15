from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.models.user import UserRole
from app.repositories.price_tier_repository import PriceTierRepository
from app.schemas.price_tier import PriceTierOut, PriceTierCreateIn, PriceTierUpdateIn

router = APIRouter(
    prefix="/admin/price-tiers",
    tags=["admin-price-tiers"],
    dependencies=[Depends(require_role(UserRole.STAFF, UserRole.ADMIN))],
)

@router.post("/products/{product_id}", response_model=PriceTierOut, status_code=status.HTTP_201_CREATED)
async def create_price_tier(product_id: int, data: PriceTierCreateIn, db: AsyncSession = Depends(get_db)):
    return await PriceTierRepository(db).create(product_id, data.model_dump())

@router.patch("/{tier_id}", response_model=PriceTierOut)
async def update_price_tier(tier_id: int, data: PriceTierUpdateIn, db: AsyncSession = Depends(get_db)):
    return await PriceTierRepository(db).update(tier_id, data.model_dump(exclude_unset=True))

@router.delete("/{tier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_price_tier(tier_id: int, db: AsyncSession = Depends(get_db)):
    await PriceTierRepository(db).delete(tier_id)