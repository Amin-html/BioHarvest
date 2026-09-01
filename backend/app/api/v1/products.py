from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.product_repository import ProductRepository
from app.services.product_service import ProductService
from app.schemas.product import ProductOut

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=list[ProductOut])
async def list_products(db: AsyncSession = Depends(get_db)):
    service = ProductService(ProductRepository(db))
    return await service.list_products()