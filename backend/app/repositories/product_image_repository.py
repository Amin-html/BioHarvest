from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product
from app.models.product_image import ProductImage

class ProductImageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, product_id: int, data: dict) -> ProductImage:
        product = await self.db.get(Product, product_id)
        if product is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")

        image = ProductImage(product_id=product_id, **data)
        self.db.add(image)
        await self.db.commit()
        await self.db.refresh(image)
        return image

    async def delete(self, image_id: int) -> None:
        image = await self.db.get(ProductImage, image_id)
        if image is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Image not found")
        await self.db.delete(image)
        await self.db.commit()
