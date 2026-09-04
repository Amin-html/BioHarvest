from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.cart import Cart
from app.models.cart_item import CartItem

class CartRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_cart(self, user_id: int) -> Cart:
        result = await self.db.execute(
            select(Cart).where(Cart.user_id == user_id).options(selectinload(Cart.items))
        )
        cart = result.scalar_one_or_none()
        if cart is None:
            cart = Cart(user_id=user_id)
            self.db.add(cart)
            await self.db.commit()
            await self.db.refresh(cart, attribute_names=["items"])
        return cart

    async def get_item(self, cart_id: int, product_id: int) -> CartItem | None:
        result = await self.db.execute(
            select(CartItem).where(CartItem.cart_id == cart_id, CartItem.product_id == product_id)
        )
        return result.scalar_one_or_none()

    async def get_item_by_id(self, item_id: int) -> CartItem | None:
        return await self.db.get(CartItem, item_id)

    async def add_item(self, cart_id: int, product_id: int, quantity: int) -> CartItem:
        item = CartItem(cart_id=cart_id, product_id=product_id, quantity=quantity)
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def update_quantity(self, item: CartItem, quantity: int):
        item.quantity = quantity
        await self.db.commit()

    async def delete_item(self, item: CartItem):
        await self.db.delete(item)
        await self.db.commit()

    async def clear(self, cart_id: int):
        from sqlalchemy import delete
        await self.db.execute(delete(CartItem).where(CartItem.cart_id == cart_id))
        await self.db.commit()