from fastapi import HTTPException, status
from app.repositories.category_repository import CategoryRepository
from app.models.category import Category

class CategoryService:
    def __init__(self, repo: CategoryRepository):
        self.repo = repo

    async def list_categories(self):
        return await self.repo.get_all()

    async def create_category(self, data: dict):
        return await self.repo.create(data)

    async def update_category(self, category_id: int, data: dict) -> Category:
        category = await self.repo.get_by_id(category_id)
        if category is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Category not found")
        return await self.repo.update(category, data)

    async def delete_category(self, category_id: int) -> None:
        category = await self.repo.get_by_id(category_id)
        if category is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Category not found")
        if await self.repo.has_products(category_id):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Cannot delete category with existing products",
            )
        await self.repo.delete(category)