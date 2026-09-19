import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDeliveryMethods, useCheckout } from '../hooks/useOrders'
import { useCart } from '../hooks/useCart'

export function CheckoutPage() {
  const { data: methods } = useDeliveryMethods()
  const { data: cart } = useCart()
  const checkout = useCheckout()
  const navigate = useNavigate()
  const [deliveryId, setDeliveryId] = useState<number | undefined>()
  const [promoCode, setPromoCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!cart || cart.items.length === 0) return <p className="text-gray-500">Корзина пуста.</p>

  async function handleCheckout() {
    setError(null)
    try {
      const order = await checkout.mutateAsync({ deliveryMethodId: deliveryId, promoCode: promoCode || undefined })
      navigate(`/orders/${order.id}`)
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Не удалось оформить заказ')
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">Оформление заказа</h1>

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