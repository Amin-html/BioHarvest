from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.review_repository import ReviewRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.review import ReviewCreateIn, ReviewOut, ReviewSummaryOut, ReviewModerateIn
from app.models.review import ReviewStatus
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole

router = APIRouter(prefix="/products", tags=["reviews"])
admin_router = APIRouter(prefix="/admin/reviews", tags=["reviews-admin"])

@router.get("/{product_id}/reviews", response_model=ReviewSummaryOut)
async def list_reviews(product_id: int, db: AsyncSession = Depends(get_db)):
    items, average, count = await ReviewRepository(db).list_approved_for_product(product_id)
    return ReviewSummaryOut(average_rating=average, count=count, items=items)

@router.post("/{product_id}/reviews", response_model=ReviewOut, status_code=201)
async def create_review(
    product_id: int,
    data: ReviewCreateIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = await ProductRepository(db).get_by_id(product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return await ReviewRepository(db).create(
        product_id=product_id, user_id=user.id, rating=data.rating, comment=data.comment,
    )

@admin_router.get("/", response_model=list[ReviewOut],
                   dependencies=[Depends(require_role(UserRole.STAFF, UserRole.ADMIN))])
async def list_pending_reviews(db: AsyncSession = Depends(get_db)):
    return await ReviewRepository(db).list_pending()

@admin_router.patch("/{review_id}", response_model=ReviewOut,
                     dependencies=[Depends(require_role(UserRole.STAFF, UserRole.ADMIN))])
async def moderate_review(review_id: int, data: ReviewModerateIn, db: AsyncSession = Depends(get_db)):
    if data.status not in (ReviewStatus.APPROVED.value, ReviewStatus.REJECTED.value):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "status must be APPROVED or REJECTED")
    repo = ReviewRepository(db)
    review = await repo.get_by_id(review_id)
    if review is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Review not found")
    return await repo.set_status(review, ReviewStatus(data.status))
