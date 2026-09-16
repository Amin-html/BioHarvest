from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification

class NotificationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, type: str, payload: dict) -> Notification:
        notif = Notification(user_id=user_id, type=type, payload=payload)
        self.db.add(notif)
        await self.db.flush()  # НЕ commit — коммитит вызывающий код (order_service), одна транзакция
        return notif

    async def get_for_user(self, user_id: int) -> list[Notification]:
        result = await self.db.execute(
            select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
        )
        return list(result.scalars().all())