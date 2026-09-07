from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.delivery_repository import DeliveryRepository
from app.schemas.delivery import DeliveryZoneOut, DeliveryMethodOut

router = APIRouter(prefix="/delivery", tags=["delivery"])

@router.get("/zones/", response_model=list[DeliveryZoneOut])
async def list_zones(db: AsyncSession = Depends(get_db)):
    return await DeliveryRepository(db).list_zones()

@router.get("/methods/", response_model=list[DeliveryMethodOut])
async def list_methods(db: AsyncSession = Depends(get_db)):
    return await DeliveryRepository(db).list_methods()