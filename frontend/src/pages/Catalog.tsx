import { useState } from 'react'
import { useProducts, useCategories } from '../hooks/useCatalog'
import { useAddToCart } from '../hooks/useCart'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { ImageOff } from 'lucide-react'

export function CatalogPage() {
  const { data: products, isLoading } = useProducts()
  const { data: categories } = useCategories()
  const addToCart = useAddToCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all')

  if (isLoading) return <p className="text-gray-500">Загрузка каталога...</p>

  const visible = (products ?? []).filter(
  (p) => p.is_active && (categoryFilter === 'all' || p.category_id === categoryFilter),
)

  function handleAdd(productId: number) {
    if (!user) {
      navigate('/login')
      return
    }
    addToCart.mutate({ product_id: productId })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">Каталог</h1>

      {categories && categories.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${categoryFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}
          >
            Все
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1 rounded-full text-sm ${categoryFilter === c.id ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {visible.map((p) => {
          const thumb = p.images[0]
          return (
            <div key={p.id} className="border rounded-xl p-4 flex flex-col gap-2 bg-white">
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
              <button
                onClick={() => handleAdd(p.id)}
                disabled={addToCart.isPending}
                className="mt-auto bg-emerald-600 text-white text-sm rounded-lg py-2 hover:bg-emerald-700 disabled:opacity-50"
              >
                В корзину
              </button>
            </div>
          )
        })}
      </div>

      {visible.length === 0 && <p className="text-gray-500">Товаров пока нет.</p>}
    </div>
  )
}