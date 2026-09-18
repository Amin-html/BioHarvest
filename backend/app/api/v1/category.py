from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.category_repository import CategoryRepository
from app.services.category_service import CategoryService
from app.schemas.category import CategoryOut, CategoryCreateIn, CategoryUpdateIn
from app.core.dependencies import require_role
from app.models.user import UserRole

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    service = CategoryService(CategoryRepository(db))
    return await service.list_categories()

@router.post("/", response_model=CategoryOut, status_code=201,
             dependencies=[Depends(require_role(UserRole.STAFF, UserRole.ADMIN))])
async def create_category(data: CategoryCreateIn, db: AsyncSession = Depends(get_db)):
    service = CategoryService(CategoryRepository(db))
    return await service.create_category(data.model_dump())

@router.patch("/{category_id}", response_model=CategoryOut,
              dependencies=[Depends(require_role(UserRole.STAFF, UserRole.ADMIN))])
async def update_category(
    category_id: int,
    data: CategoryUpdateIn,
    db: AsyncSession = Depends(get_db),
):
    service = CategoryService(CategoryRepository(db))
    result = await service.update_category(category_id, data.model_dump(exclude_unset=True))
    await db.commit()
    return result

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role(UserRole.STAFF, UserRole.ADMIN))])
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
):
    service = CategoryService(CategoryRepository(db))
    await service.delete_category(category_id)
    await db.commit()