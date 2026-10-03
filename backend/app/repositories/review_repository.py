from fastapi import HTTPException, status
from sqlalchemy import select, func, exists, and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review import Review, ReviewStatus
from app.models.order import Order
from app.models.order_item import OrderItem

class ReviewRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def has_purchased(self, user_id: int, product_id: int) -> bool:
        query = select(
            exists().where(
                and_(
                    Order.user_id == user_id,
                    Order.status != "CANCELLED",
                    OrderItem.order_id == Order.id,
                    OrderItem.product_id == product_id,
                )
            )
        )
        result = await self.db.execute(query)
        return bool(result.scalar())

    async def create(self, *, product_id: int, user_id: int, rating: int, comment: str | None) -> Review:
        verified = await self.has_purchased(user_id, product_id)
        review = Review(
            product_id=product_id, user_id=user_id, rating=rating, comment=comment,
            is_verified_purchase=verified, status=ReviewStatus.PENDING,
        )
        self.db.add(review)
        try:
            await self.db.commit()
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(status.HTTP_409_CONFLICT, "You already reviewed this product")
        await self.db.refresh(review)
        return review

    async def list_approved_for_product(self, product_id: int) -> tuple[list[Review], float | None, int]:
        result = await self.db.execute(
            select(Review)
            .where(Review.product_id == product_id, Review.status == ReviewStatus.APPROVED)
            .order_by(Review.created_at.desc())
        )
        items = list(result.scalars().all())
        if not items:
            return [], None, 0
        avg = sum(r.rating for r in items) / len(items)
        return items, round(avg, 2), len(items)

    async def list_pending(self) -> list[Review]:
        result = await self.db.execute(
            select(Review).where(Review.status == ReviewStatus.PENDING).order_by(Review.created_at.asc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, review_id: int) -> Review | None:
        return await self.db.get(Review, review_id)

    async def set_status(self, review: Review, new_status: ReviewStatus) -> Review:
        review.status = new_status
        await self.db.commit()
        await self.db.refresh(review)
        return review

    async def average_rating_map(self, product_ids: list[int]) -> dict[int, tuple[float, int]]:
        """Для карточек каталога: средний рейтинг и число отзывов по списку товаров одним запросом."""
        if not product_ids:
            return {}
        query = (
            select(Review.product_id, func.avg(Review.rating), func.count(Review.id))
            .where(Review.product_id.in_(product_ids), Review.status == ReviewStatus.APPROVED)
            .group_by(Review.product_id)
        )
        result = await self.db.execute(query)
        return {row[0]: (round(float(row[1]), 2), row[2]) for row in result.all()}
