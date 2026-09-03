from app.repositories.category_repository import CategoryRepository

class CategoryService:
    def __init__(self, repo: CategoryRepository):
        self.repo = repo

    async def list_categories(self):
        return await self.repo.get_all()

    async def create_category(self, data: dict):
        return await self.repo.create(data)