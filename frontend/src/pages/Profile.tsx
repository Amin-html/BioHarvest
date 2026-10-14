import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  type AddressInput,
} from '../hooks/useAddresses'
import type { Address } from '../types/api'
import { User as UserIcon, MapPin, Star, Pencil, Trash2, Plus } from 'lucide-react'

function ProfileForm() {
  const { user, updateProfile } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await updateProfile({ full_name: fullName, phone })
      setSuccess(true)
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Не удалось сохранить профиль')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-4 bg-white space-y-3">
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Имя</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Как к вам обращаться?"
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Телефон</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+996 7XX XXX XXX"
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-emerald-600 text-sm">Сохранено.</p>}
      <button
        type="submit"
        disabled={saving}
        className="bg-emerald-600 text-white rounded-lg py-2 px-4 font-semibold hover:bg-emerald-700 disabled:opacity-50"
      >
        {saving ? 'Сохраняем...' : 'Сохранить'}
      </button>
    </form>
  )
}

function AddressForm({
  initial,
  onSubmit,
  onCancel,
  pending,
}: {
  initial?: Address
  onSubmit: (data: AddressInput) => void
  onCancel: () => void
  pending: boolean
}) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [fullAddress, setFullAddress] = useState(initial?.full_address ?? '')
  const [city, setCity] = useState(initial?.city ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [isDefault, setIsDefault] = useState(initial?.is_default ?? false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!fullAddress.trim()) return
    onSubmit({
      label: label || undefined,
      full_address: fullAddress,
      city: city || undefined,
      phone: phone || undefined,
      is_default: isDefault,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-4 bg-gray-50 space-y-3">
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Название (например, Дом)</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Адрес</label>
        <input
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
          placeholder="ул. Чуй 123, кв. 45"
          className="w-full border rounded-lg px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Город</label>
        <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Телефон для доставки</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
        Сделать адресом по умолчанию
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-emerald-600 text-white rounded-lg py-2 px-4 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? 'Сохраняем...' : 'Сохранить'}
        </button>
        <button type="button" onClick={onCancel} className="text-gray-500 text-sm px-4 hover:text-gray-700">
          Отмена
        </button>
      </div>
    </form>
  )
}

function AddressBook() {
  const { data: addresses, isLoading } = useAddresses()
  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()
  const deleteAddress = useDeleteAddress()
  const [showNew, setShowNew] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-emerald-700 flex items-center gap-2">
          <MapPin size={18} />
          Адреса доставки
        </h2>
        {!showNew && (
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <Plus size={16} />
            Добавить
          </button>
        )}
      </div>

      {showNew && (
        <AddressForm
          pending={createAddress.isPending}
          onCancel={() => setShowNew(false)}
          onSubmit={(data) => createAddress.mutate(data, { onSuccess: () => setShowNew(false) })}
        />
      )}

      {isLoading && <p className="text-gray-500 text-sm">Загрузка адресов...</p>}
      {!isLoading && addresses?.length === 0 && !showNew && (
        <p className="text-gray-500 text-sm">Адресов пока нет.</p>
      )}

      <div className="space-y-2">
        {addresses?.map((address) =>
          editingId === address.id ? (
            <AddressForm
              key={address.id}
              initial={address}
              pending={updateAddress.isPending}
              onCancel={() => setEditingId(null)}
              onSubmit={(data) =>
                updateAddress.mutate(
                  { id: address.id, data },
                  { onSuccess: () => setEditingId(null) }
                )
              }
            />
          ) : (
            <div key={address.id} className="border rounded-xl p-4 bg-white flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {address.label || 'Адрес'}
                  {address.is_default && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
                      <Star size={12} fill="currentColor" />
                      По умолчанию
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {address.full_address}
                  {address.city ? `, ${address.city}` : ''}
                </p>
                {address.phone && <p className="text-sm text-gray-500">{address.phone}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditingId(address.id)}
                  className="text-gray-500 hover:text-emerald-600"
                  title="Изменить"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteAddress.mutate(address.id)}
                  className="text-gray-500 hover:text-red-600"
                  title="Удалить"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export function ProfilePage() {
  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
          <UserIcon size={22} />
          Профиль
        </h1>
        <ProfileForm />
      </div>
      <AddressBook />
    </div>
  )
}
