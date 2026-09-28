from fastapi import HTTPException, status
from app.repositories.product_repository import ProductRepository
from app.models.product import Product

class ProductService:
    def __init__(self, repo: ProductRepository):
        self.repo = repo

    async def list_products(self):
        return await self.repo.get_all()

    async def get_by_slug(self, slug: str) -> Product:
        product = await self.repo.get_by_slug(slug)
        if product is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
        return product

    async def search_products(
        self,
        *,
        q: str | None,
        category_id: int | None,
        min_price: float | None,
        max_price: float | None,
        sort: str | None,
        page: int,
        page_size: int,
    ):
        return await self.repo.search(
            q=q, category_id=category_id, min_price=min_price, max_price=max_price,
            sort=sort, page=page, page_size=page_size,
        )

    async def create_product(self, data: dict):
        return await self.repo.create(data)

    async def update_product(self, product_id: int, data: dict) -> Product:
        product = await self.repo.get_by_id(product_id)   # было self.product_repo
        if product is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
        return await self.repo.update(product, data)      # было self.product_repo

    async def delete_product(self, product_id: int) -> None:
        product = await self.repo.get_by_id(product_id)   # было self.product_repo
        if product is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
        await self.repo.soft_delete(product)               # было self.product_repo