from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.wishlist_item import WishlistItem
from app.models.product import Product

class WishlistRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_for_user(self, user_id: int) -> list[WishlistItem]:
        result = await self.db.execute(
            select(WishlistItem)
            .where(WishlistItem.user_id == user_id)
            .options(selectinload(WishlistItem.product).selectinload(Product.images))
        )
        return list(result.scalars().all())

    async def add(self, user_id: int, product_id: int) -> WishlistItem:
        item = WishlistItem(user_id=user_id, product_id=product_id)
        self.db.add(item)
        try:
            await self.db.commit()
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(status.HTTP_409_CONFLICT, "Already in wishlist")
        await self.db.refresh(item, attribute_names=["product"])
        await self.db.refresh(item.product, attribute_names=["images"])
        return item

    async def remove(self, user_id: int, product_id: int) -> None:
        result = await self.db.execute(
            select(WishlistItem).where(
                WishlistItem.user_id == user_id, WishlistItem.product_id == product_id
            )
        )
        item = result.scalar_one_or_none()
        if item is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Not in wishlist")
        await self.db.delete(item)
        await self.db.commit()
