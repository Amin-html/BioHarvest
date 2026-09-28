import { useEffect, useState } from 'react'
import { useProductSearch, useCategories } from '../hooks/useCatalog'
import { useAddToCart } from '../hooks/useCart'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { ImageOff, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductSearchParams } from '../hooks/useCatalog'

const SORT_OPTIONS: { value: NonNullable<ProductSearchParams['sort']> | ''; label: string }[] = [
  { value: '', label: 'По умолчанию' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
  { value: 'name_asc', label: 'По названию' },
  { value: 'newest', label: 'Сначала новые' },
]

export function CatalogPage() {
  const { data: categories } = useCategories()
  const addToCart = useAddToCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all')
  const [sort, setSort] = useState<ProductSearchParams['sort'] | ''>('')
  const [rawQuery, setRawQuery] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  // Дебаунс поискового поля — не долбим сервер на каждую нажатую клавишу.
  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery), 400)
    return () => clearTimeout(t)
  }, [rawQuery])

  // Смена фильтра/поиска/сортировки — всегда возвращаемся на первую страницу.
  useEffect(() => {
    setPage(1)
  }, [query, categoryFilter, sort])

  const { data, isLoading } = useProductSearch({
    q: query || undefined,
    category_id: categoryFilter === 'all' ? undefined : categoryFilter,
    sort: sort || undefined,
    page,
  })

  function handleAdd(productId: number) {
    if (!user) {
      navigate('/login')
      return
    }
    addToCart.mutate({ product_id: productId })
  }

  const items = data?.items ?? []
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1

  return (
    <div>
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">Каталог</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as ProductSearchParams['sort'])}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

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

      {isLoading ? (
        <p className="text-gray-500">Загрузка каталога...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((p) => {
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

          {items.length === 0 && <p className="text-gray-500">Ничего не найдено.</p>}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-500">Стр. {page} из {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}