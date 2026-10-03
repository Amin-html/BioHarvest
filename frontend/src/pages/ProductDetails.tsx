import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProduct } from '../hooks/useCatalog'
import { useAddToCart } from '../hooks/useCart'
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '../hooks/useWishlist'
import { useProductReviews, useCreateReview } from '../hooks/useReviews'
import { useAuth } from '../context/AuthContext'
import { ImageOff, ChevronLeft, Heart, Star } from 'lucide-react'

export function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading } = useProduct(slug)
  const addToCart = useAddToCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeImage, setActiveImage] = useState(0)

  const { data: wishlist } = useWishlist()
  const addToWishlist = useAddToWishlist()
  const removeFromWishlist = useRemoveFromWishlist()
  const inWishlist = !!wishlist?.items.some((i) => i.product_id === product?.id)

  if (isLoading) return <p className="text-gray-500">Загрузка товара...</p>
  if (!product) return <p className="text-gray-500">Товар не найден.</p>

  const images = product.images
  const current = images[activeImage]

  function handleAdd() {
    if (!user) {
      navigate('/login')
      return
    }
    addToCart.mutate({ product_id: product!.id })
  }

  function handleToggleWishlist() {
    if (!user) {
      navigate('/login')
      return
    }
    if (inWishlist) {
      removeFromWishlist.mutate(product!.id)
    } else {
      addToWishlist.mutate(product!.id)
    }
  }

  return (
    <div>
      <Link to="/catalog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 mb-4">
        <ChevronLeft size={16} />
        Назад в каталог
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square border rounded-xl bg-white flex items-center justify-center overflow-hidden">
            {current ? (
              <img src={current.url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <ImageOff className="text-gray-300" size={48} />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg border overflow-hidden ${i === activeImage ? 'border-emerald-600' : 'border-gray-200'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-emerald-700 mb-2">{product.name}</h1>
            <button
              onClick={handleToggleWishlist}
              className={`shrink-0 mt-1 ${inWishlist ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
              title={inWishlist ? 'Убрать из избранного' : 'В избранное'}
            >
              <Heart size={24} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>
          <p className="text-2xl font-bold text-cyan-600 mb-4">{product.price} сом</p>
          {product.description && (
            <p className="text-gray-600 whitespace-pre-line mb-6">{product.description}</p>
          )}
          <button
            onClick={handleAdd}
            disabled={addToCart.isPending || !product.is_active}
            className="bg-emerald-600 text-white rounded-lg px-6 py-2.5 font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            {product.is_active ? 'В корзину' : 'Нет в наличии'}
          </button>
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  )
}

function ProductReviews({ productId }: { productId: number }) {
  const { user } = useAuth()
  const { data: summary, isLoading } = useProductReviews(productId)
  const createReview = useCreateReview(productId)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    setError(null)
    try {
      await createReview.mutateAsync({ rating, comment: comment.trim() || undefined })
      setSubmitted(true)
      setComment('')
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Не удалось отправить отзыв')
    }
  }

  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-xl font-bold text-emerald-700 mb-3">Отзывы</h2>

      {isLoading ? (
        <p className="text-gray-500">Загрузка отзывов...</p>
      ) : !summary || summary.count === 0 ? (
        <p className="text-gray-500 mb-6">Пока нет отзывов — будьте первым.</p>
      ) : (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star size={18} className="text-amber-400" fill="currentColor" />
            <span className="font-semibold">{summary.average_rating}</span>
            <span className="text-sm text-gray-500">({summary.count} отзывов)</span>
          </div>
          <div className="space-y-3">
            {summary.items.map((r) => (
              <div key={r.id} className="border rounded-xl p-3 bg-white">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < r.rating ? 'text-amber-400' : 'text-gray-200'}
                      fill="currentColor"
                    />
                  ))}
                  {r.is_verified_purchase && (
                    <span className="text-xs text-emerald-600 ml-2">Проверенная покупка</span>
                  )}
                </div>
                {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {user ? (
        submitted ? (
          <p className="text-sm text-emerald-600">
            Спасибо! Отзыв отправлен на модерацию и появится после проверки.
          </p>
        ) : (
          <div className="border rounded-xl p-4 bg-white max-w-md">
            <p className="text-sm font-medium mb-2">Оставить отзыв</p>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} onClick={() => setRating(i + 1)} type="button">
                  <Star
                    size={20}
                    className={i < rating ? 'text-amber-400' : 'text-gray-200'}
                    fill="currentColor"
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Комментарий (необязательно)"
              rows={3}
              className="border rounded-lg px-2 py-1.5 w-full text-sm mb-2"
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={createReview.isPending}
              className="bg-emerald-600 text-white rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              Отправить
            </button>
          </div>
        )
      ) : (
        <p className="text-sm text-gray-500">
          <Link to="/login" className="text-emerald-600 hover:underline">Войдите</Link>, чтобы оставить отзыв.
        </p>
      )}
    </div>
  )
}
