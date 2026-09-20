import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCategories } from '../../hooks/useCatalog'
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type CategoryCreateInput,
} from '../../hooks/useAdminCategories'
import { Pencil, Trash2, X, Check } from 'lucide-react'

export function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset } = useForm<CategoryCreateInput>()

  async function onCreate(values: CategoryCreateInput) {
    await createCategory.mutateAsync(values)
    reset()
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteCategory.mutateAsync(id)
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Не удалось удалить категорию')
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit(onCreate)}
        className="flex flex-wrap gap-2 items-end mb-4 border rounded-xl p-4 bg-white"
      >
        <div>
          <label className="block text-xs text-gray-500 mb-1">Название</label>
          <input {...register('name', { required: true })} className="border rounded-lg px-2 py-1.5 w-40" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Slug</label>
          <input {...register('slug', { required: true })} className="border rounded-lg px-2 py-1.5 w-32" />
        </div>
        <button
          type="submit"
          disabled={createCategory.isPending}
          className="bg-emerald-600 text-white rounded-lg px-4 py-1.5 font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          Добавить
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {isLoading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : (
        <div className="space-y-2">
          {categories?.map((c) =>
            editingId === c.id ? (
              <CategoryEditRow
                key={c.id}
                id={c.id}
                initialName={c.name}
                initialSlug={c.slug}
                onCancel={() => setEditingId(null)}
                onSaved={() => setEditingId(null)}
                updateCategory={updateCategory}
              />
            ) : (
              <div key={c.id} className="flex items-center justify-between border rounded-xl p-3 bg-white">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-gray-500">{c.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(c.id)} className="text-gray-500 hover:text-emerald-600">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-gray-500 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  )
}

function CategoryEditRow({
  id,
  initialName,
  initialSlug,
  onCancel,
  onSaved,
  updateCategory,
}: {
  id: number
  initialName: string
  initialSlug: string
  onCancel: () => void
  onSaved: () => void
  updateCategory: ReturnType<typeof useUpdateCategory>
}) {
  const [name, setName] = useState(initialName)
  const [slug, setSlug] = useState(initialSlug)

  async function handleSave() {
    await updateCategory.mutateAsync({ id, data: { name, slug } })
    onSaved()
  }

  return (
    <div className="flex items-center gap-2 border rounded-xl p-3 bg-emerald-50">
      <input value={name} onChange={(e) => setName(e.target.value)} className="border rounded-lg px-2 py-1 flex-1" />
      <input value={slug} onChange={(e) => setSlug(e.target.value)} className="border rounded-lg px-2 py-1 w-40" />
      <button onClick={handleSave} className="text-emerald-600 hover:text-emerald-800"><Check size={18} /></button>
      <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
    </div>
  )
}