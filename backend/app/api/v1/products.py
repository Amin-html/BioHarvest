from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.product_repository import ProductRepository
from app.repositories.product_image_repository import ProductImageRepository
from app.services.product_service import ProductService
from app.schemas.product import ProductOut, ProductCreateIn, ProductUpdateIn, ProductListOut
from app.schemas.product_image import ProductImageOut, ProductImageCreateIn
from app.core.dependencies import require_role
from app.models.user import UserRole

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=list[ProductOut])
async def list_products(db: AsyncSession = Depends(get_db)):
    service = ProductService(ProductRepository(db))
    return await service.list_products()

@router.get("/search", response_model=ProductListOut)
async def search_products(
    q: str | None = Query(None, description="Поиск по названию"),
    category_id: int | None = Query(None),
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    sort: str | None = Query(None, description="price_asc | price_desc | name_asc | newest"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(ProductRepository(db))
    items, total = await service.search_products(
        q=q, category_id=category_id, min_price=min_price, max_price=max_price,
        sort=sort, page=page, page_size=page_size,
    )
    return ProductListOut(items=items, total=total, page=page, page_size=page_size)

@router.get("/{slug}", response_model=ProductOut)
async def get_product_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    service = ProductService(ProductRepository(db))
    return await service.get_by_slug(slug)

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
@router.post("/{product_id}/images", response_model=ProductImageOut, status_code=201,
             dependencies=[Depends(require_role(UserRole.STAFF, UserRole.ADMIN))])
async def add_product_image(product_id: int, data: ProductImageCreateIn, db: AsyncSession = Depends(get_db)):
    return await ProductImageRepository(db).create(product_id, data.model_dump())

@router.delete("/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role(UserRole.STAFF, UserRole.ADMIN))])
async def delete_product_image(image_id: int, db: AsyncSession = Depends(get_db)):
    await ProductImageRepository(db).delete(image_id)