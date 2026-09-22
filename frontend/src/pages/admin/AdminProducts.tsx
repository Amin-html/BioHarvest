import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useProducts, useCategories } from '../../hooks/useCatalog'
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type ProductCreateInput,
} from '../../hooks/useAdminProducts'
import { Pencil, Trash2, X, Check } from 'lucide-react'
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

  async function handleSave() {
    await updateProduct.mutateAsync({
      id: product.id,
      data: { name, price: Number(price), is_active: isActive, category_id: categoryId },
    })
    onSaved()
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 border rounded-xl p-3 bg-emerald-50">
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
    )
  }

  return (
    <div className={`flex items-center justify-between border rounded-xl p-3 bg-white ${!product.is_active ? 'opacity-50' : ''}`}>
      <div>
        <p className="font-medium">{product.name} {!product.is_active && <span className="text-xs text-red-500">(неактивен)</span>}</p>
        <p className="text-sm text-gray-500">{product.slug} — {product.price} сом</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="text-gray-500 hover:text-emerald-600"><Pencil size={18} /></button>
        <button onClick={onDelete} className="text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
      </div>
    </div>
  )
}