import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDeliveryMethods, useCheckout } from '../hooks/useOrders'
import { useCart } from '../hooks/useCart'
import { useAddresses } from '../hooks/useAddresses'

export function CheckoutPage() {
  const { data: methods } = useDeliveryMethods()
  const { data: cart } = useCart()
  const { data: addresses } = useAddresses()
  const checkout = useCheckout()
  const navigate = useNavigate()
  const [deliveryId, setDeliveryId] = useState<number | undefined>()
  const [promoCode, setPromoCode] = useState('')
  const [addressId, setAddressId] = useState<number | undefined>()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (addressId === undefined && addresses?.length) {
      const def = addresses.find((a) => a.is_default) ?? addresses[0]
      setAddressId(def.id)
    }
  }, [addresses, addressId])

  if (!cart || cart.items.length === 0) return <p className="text-gray-500">Корзина пуста.</p>

  async function handleCheckout() {
    setError(null)
    try {
      const order = await checkout.mutateAsync({
        deliveryMethodId: deliveryId,
        promoCode: promoCode || undefined,
        addressId,
      })
      navigate(`/orders/${order.id}`)
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Не удалось оформить заказ')
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">Оформление заказа</h1>

      <label className="block mb-2 text-sm font-medium text-gray-700">Адрес доставки</label>
      {addresses && addresses.length > 0 ? (
        <select
          value={addressId ?? ''}
          onChange={(e) => setAddressId(e.target.value ? Number(e.target.value) : undefined)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        >
          <option value="">Без адреса</option>
          {addresses.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label ? `${a.label} — ` : ''}
              {a.full_address}
              {a.city ? `, ${a.city}` : ''}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          Нет сохранённых адресов.{' '}
          <Link to="/profile" className="text-emerald-600 hover:underline">
            Добавить в профиле
          </Link>
        </p>
      )}

      <label className="block mb-2 text-sm font-medium text-gray-700">Способ доставки</label>
      <select
        value={deliveryId ?? ''}
        onChange={(e) => setDeliveryId(e.target.value ? Number(e.target.value) : undefined)}
        className="w-full border rounded-lg px-3 py-2 mb-4"
      >
        <option value="">Без доставки</option>
        {methods?.map((m) => (
          <option key={m.id} value={m.id}>
            {m.type} — {m.price} сом ({m.eta_days} дн.)
          </option>
        ))}
      </select>

      <label className="block mb-2 text-sm font-medium text-gray-700">Промокод</label>
      <input
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value)}
        placeholder="Есть промокод?"
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={checkout.isPending}
        className="w-full bg-emerald-600 text-white rounded-lg py-2 font-semibold hover:bg-emerald-700 disabled:opacity-50"
      >
        {checkout.isPending ? 'Оформляем...' : 'Подтвердить заказ'}
      </button>
    </div>
  )
}