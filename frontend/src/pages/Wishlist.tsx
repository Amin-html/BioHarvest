import { Link } from 'react-router-dom'
import { useWishlist, useRemoveFromWishlist } from '../hooks/useWishlist'
import { useAddToCart } from '../hooks/useCart'
import { Heart, ImageOff } from 'lucide-react'

export function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist()
  const removeItem = useRemoveFromWishlist()
  const addToCart = useAddToCart()

  if (isLoading) return <p className="text-gray-500">Загрузка избранного...</p>
  if (!wishlist || wishlist.items.length === 0) {
    return <p className="text-gray-500">В избранном пока пусто.</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
        <Heart size={22} />
        Избранное
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlist.items.map((item) => {
          const p = item.product
          const thumb = p.images[0]
          return (
            <div key={item.id} className="border rounded-xl p-4 flex flex-col gap-2 bg-white">
              <Link to={`/products/${p.slug}`} className="flex flex-col gap-2">
                <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                  {thumb ? (
                    <img src={thumb.url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageOff className="text-gray-300" size={28} />
                  )}
                </div>
                <span className="font-medium">{p.name}</span>
                <span className="text-cyan-600 font-bold">{p.price} сом</span>
              </Link>
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => addToCart.mutate({ product_id: p.id })}
                  disabled={addToCart.isPending || !p.is_active}
                  className="flex-1 bg-emerald-600 text-white text-sm rounded-lg py-2 hover:bg-emerald-700 disabled:opacity-50"
                >
                  В корзину
                </button>
                <button
                  onClick={() => removeItem.mutate(p.id)}
                  className="text-red-500 hover:text-red-700 px-2"
                  title="Убрать из избранного"
                >
                  <Heart size={18} fill="currentColor" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
