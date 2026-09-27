import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProduct } from '../hooks/useCatalog'
import { useAddToCart } from '../hooks/useCart'
import { useAuth } from '../context/AuthContext'
import { ImageOff, ChevronLeft } from 'lucide-react'

export function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading } = useProduct(slug)
  const addToCart = useAddToCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeImage, setActiveImage] = useState(0)

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
          <h1 className="text-2xl font-bold text-emerald-700 mb-2">{product.name}</h1>
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
    </div>
  )
}
