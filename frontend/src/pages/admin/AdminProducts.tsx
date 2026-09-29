import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useProducts, useCategories } from '../../hooks/useCatalog'
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAddProductImage,
  useDeleteProductImage,
  type ProductCreateInput,
} from '../../hooks/useAdminProducts'
import { Pencil, Trash2, X, Check, Plus, ImageOff } from 'lucide-react'
import type { Product } from '../../types/api'

export function AdminProductsPage() {
  const { data: products, isLoading } = useProducts()
  const { data: categories } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()
  const [editingId, setEditingId] = useState<number | null>(null)

  const { register, handleSubmit, reset } = useForm<ProductCreateInput>({
    defaultValues: { name: '', slug: '', price: 0, category_id: categories?.[0]?.id ?? 0, is_active: true },
  })

  async function onCreate(values: ProductCreateInput) {
    await createProduct.mutateAsync({ ...values, price: Number(values.price), category_id: Number(values.category_id) })
    reset()
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit(onCreate)}
        className="flex flex-wrap gap-2 items-end mb-6 border rounded-xl p-4 bg-white"
      >
        <div>
          <label className="block text-xs text-gray-500 mb-1">Название</label>
          <input {...register('name', { required: true })} className="border rounded-lg px-2 py-1.5 w-40" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Slug</label>
          <input {...register('slug', { required: true })} className="border rounded-lg px-2 py-1.5 w-32" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Цена</label>
          <input type="number" step="0.01" {...register('price', { required: true })} className="border rounded-lg px-2 py-1.5 w-24" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Категория</label>
          <select {...register('category_id', { required: true })} className="border rounded-lg px-2 py-1.5">
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-40">
          <label className="block text-xs text-gray-500 mb-1">Описание</label>
          <input {...register('description')} className="border rounded-lg px-2 py-1.5 w-full" />
        </div>
        <button
          type="submit"
          disabled={createProduct.isPending}
          className="bg-emerald-600 text-white rounded-lg px-4 py-1.5 font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          Добавить
        </button>
      </form>

      {isLoading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : (
        <div className="space-y-2">
          {products?.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              categories={categories ?? []}
              editing={editingId === p.id}
              onEdit={() => setEditingId(p.id)}
              onCancelEdit={() => setEditingId(null)}
              onSaved={() => setEditingId(null)}
              onDelete={() => deleteProduct.mutate(p.id)}
              updateProduct={updateProduct}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductRow({
  product,
  categories,
  editing,
  onEdit,
  onCancelEdit,
  onSaved,
  onDelete,
  updateProduct,
}: {
  product: Product
  categories: { id: number; name: string }[]
  editing: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onSaved: () => void
  onDelete: () => void
  updateProduct: ReturnType<typeof useUpdateProduct>
}) {
  const [name, setName] = useState(product.name)
  const [price, setPrice] = useState(product.price)
  const [isActive, setIsActive] = useState(product.is_active)
  const [categoryId, setCategoryId] = useState(product.category_id)
  const [description, setDescription] = useState(product.description ?? '')

  async function handleSave() {
    await updateProduct.mutateAsync({
      id: product.id,
      data: { name, price: Number(price), is_active: isActive, category_id: categoryId, description },
    })
    onSaved()
  }

  return (
    <div className={`border rounded-xl p-3 bg-white ${!product.is_active ? 'opacity-50' : ''}`}>
      {editing ? (
        <div className="flex flex-col gap-2 bg-emerald-50 -m-3 p-3 rounded-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <input value={name} onChange={(e) => setName(e.target.value)} className="border rounded-lg px-2 py-1 flex-1" />
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="border rounded-lg px-2 py-1 w-24"
            />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="border rounded-lg px-2 py-1"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              активен
            </label>
            <button onClick={handleSave} className="text-emerald-600 hover:text-emerald-800"><Check size={18} /></button>
            <button onClick={onCancelEdit} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание товара"
            rows={2}
            className="border rounded-lg px-2 py-1 w-full text-sm"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{product.name} {!product.is_active && <span className="text-xs text-red-500">(неактивен)</span>}</p>
            <p className="text-sm text-gray-500">{product.slug} — {product.price} сом</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onEdit} className="text-gray-500 hover:text-emerald-600"><Pencil size={18} /></button>
            <button onClick={onDelete} className="text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
          </div>
        </div>
      )}
      <ProductImagesManager product={product} />
    </div>
  )
}

function ProductImagesManager({ product }: { product: Product }) {
  const addImage = useAddProductImage()
  const deleteImage = useDeleteProductImage()
  const [url, setUrl] = useState('')

  async function handleAdd() {
    if (!url.trim()) return
    await addImage.mutateAsync({ productId: product.id, url: url.trim() })
    setUrl('')
  }

  return (
    <div className="mt-3 pt-3 border-t flex items-center gap-3 flex-wrap">
      {product.images.length === 0 ? (
        <span className="text-xs text-gray-400 flex items-center gap-1"><ImageOff size={14} /> Нет фото</span>
      ) : (
        product.images.map((img) => (
          <div key={img.id} className="relative group">
            <img src={img.url} alt="" className="w-12 h-12 rounded-lg object-cover border" />
            <button
              onClick={() => deleteImage.mutate(img.id)}
              className="absolute -top-1.5 -right-1.5 bg-white border rounded-full text-red-500 hover:text-red-700"
            >
              <X size={14} />
            </button>
          </div>
        ))
      )}
      <div className="flex items-center gap-1 ml-auto">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL картинки"
          className="border rounded-lg px-2 py-1 text-sm w-40"
        />
        <button
          onClick={handleAdd}
          disabled={addImage.isPending || !url.trim()}
          className="text-emerald-600 hover:text-emerald-800 disabled:opacity-40"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  )
}