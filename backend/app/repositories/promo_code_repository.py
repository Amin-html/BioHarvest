from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.promo_code import PromoCode

class PromoCodeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_for_update(self, code: str) -> PromoCode | None:
        # FOR UPDATE — та же логика, что и со стоком: два одновременных
        # заказа с последним доступным использованием промокода не должны
        # оба пройти проверку used_count < max_uses.
        result = await self.db.execute(
            select(PromoCode).where(PromoCode.code == code).with_for_update()
        )
        return result.scalar_one_or_none()

    async def increment_usage(self, promo: PromoCode) -> None:
        promo.used_count += 1