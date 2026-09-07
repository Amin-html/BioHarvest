from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.delivery_zone import DeliveryZone
from app.models.delivery_method import DeliveryMethod

class DeliveryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_zones(self) -> list[DeliveryZone]:
        result = await self.db.execute(select(DeliveryZone))
        return list(result.scalars().all())

    async def list_methods(self) -> list[DeliveryMethod]:
        result = await self.db.execute(select(DeliveryMethod))
        return list(result.scalars().all())

    async def get_method_by_id(self, method_id: int) -> DeliveryMethod | None:
        return await self.db.get(DeliveryMethod, method_id)