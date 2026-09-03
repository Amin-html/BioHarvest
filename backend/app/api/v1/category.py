from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.category_repository import CategoryRepository
from app.services.category_service import CategoryService
from app.schemas.category import CategoryOut, CategoryCreateIn
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