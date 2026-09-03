from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.product_repository import ProductRepository
from app.services.product_service import ProductService
from app.schemas.product import ProductOut, ProductCreateIn
from app.core.dependencies import require_role
from app.models.user import UserRole

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=list[ProductOut])
async def list_products(db: AsyncSession = Depends(get_db)):
    service = ProductService(ProductRepository(db))
    return await service.list_products()

@router.post("/", response_model=ProductOut, status_code=201,
             dependencies=[Depends(require_role(UserRole.STAFF, UserRole.ADMIN))])
async def create_product(data: ProductCreateIn, db: AsyncSession = Depends(get_db)):
    service = ProductService(ProductRepository(db))
    return await service.create_product(data.model_dump())