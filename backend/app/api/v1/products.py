from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.product_repository import ProductRepository
from app.services.product_service import ProductService
from app.schemas.product import ProductOut, ProductCreateIn, ProductUpdateIn
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

@router.patch("/{product_id}", response_model=ProductOut,
              dependencies=[Depends(require_role(UserRole.STAFF, UserRole.ADMIN))])
async def update_product(
    product_id: int,
    data: ProductUpdateIn,
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(ProductRepository(db))
    result = await service.update_product(product_id, data.model_dump(exclude_unset=True))
    await db.commit()
    return result

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role(UserRole.STAFF, UserRole.ADMIN))])
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(ProductRepository(db))
    await service.delete_product(product_id)
    await db.commit()