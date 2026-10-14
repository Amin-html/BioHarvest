import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCrops, useCalculateFertilizer } from '../hooks/useFertilizer'
import { useAddToCart } from '../hooks/useCart'
import { useAuth } from '../context/AuthContext'
import type { AreaUnit } from '../types/api'
import { Sprout, ImageOff } from 'lucide-react'

const AREA_UNIT_LABELS: Record<AreaUnit, string> = {
  sotka: 'сотка (100 м²)',
  hectare: 'гектар',
  m2: 'м²',
}

export function FertilizerCalculatorPage() {
  const { data: crops, isLoading: cropsLoading } = useCrops()
  const calculate = useCalculateFertilizer()
  const addToCart = useAddToCart()
  const { user } = useAuth()

  const [cropId, setCropId] = useState<number | undefined>()
  const [area, setArea] = useState('')
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('sotka')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const areaNum = Number(area)
    if (!cropId) {
      setError('Выберите культуру')
      return
    }
    if (!areaNum || areaNum <= 0) {
      setError('Укажите площадь больше нуля')
      return
    }
    try {
      await calculate.mutateAsync({ cropId, area: areaNum, areaUnit })
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Не удалось рассчитать')
    }
  }

  const result = calculate.data

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
        <Sprout size={22} />
        Калькулятор удобрений
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Выберите культуру и площадь участка — рассчитаем норму внесения удобрений по этапам роста.
      </p>

      <form onSubmit={handleSubmit} className="border rounded-xl p-4 bg-white space-y-3 mb-6">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Культура</label>
          <select
            value={cropId ?? ''}
            onChange={(e) => setCropId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full border rounded-lg px-3 py-2"
            disabled={cropsLoading}
          >
            <option value="">Выберите культуру</option>
            {crops?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-gray-700">Площадь</label>
            <input
              type="number"
              min="0"
              step="any"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Например, 5"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-gray-700">Единица</label>
            <select
              value={areaUnit}
              onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
              className="w-full border rounded-lg px-3 py-2"
            >
              {(Object.keys(AREA_UNIT_LABELS) as AreaUnit[]).map((unit) => (
                <option key={unit} value={unit}>
                  {AREA_UNIT_LABELS[unit]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={calculate.isPending}
          className="w-full bg-emerald-600 text-white rounded-lg py-2 font-semibold hover:bg-emerald-700 disabled:opacity-50"
        >
          {calculate.isPending ? 'Считаем...' : 'Рассчитать'}
        </button>
      </form>

      {result && (
        <div>
          <h2 className="text-lg font-bold text-emerald-700 mb-3">
            {result.crop.name} · {result.area_sotka} сот.
          </h2>
          <div className="space-y-3">
            {result.items.length === 0 && (
              <p className="text-gray-500 text-sm">Для этой культуры пока нет данных по удобрениям.</p>
            )}
            {result.items.map((item, i) => {
              const p = item.recommended_product
              const thumb = p?.images[0]
              return (
                <div key={i} className="border rounded-xl p-4 bg-white flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{item.fertilizer_name}</div>
                    <div className="text-sm text-gray-500">{item.stage}</div>
                    {item.note && <div className="text-sm text-gray-400 mt-1">{item.note}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-cyan-600 font-bold">{item.amount_kg} кг</div>
                    {p && (
                      <div className="mt-2 flex items-center gap-2">
                        <Link to={`/products/${p.slug}`} className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                            {thumb ? (
                              <img src={thumb.url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageOff className="text-gray-300" size={16} />
                            )}
                          </div>
                          <span className="text-xs text-gray-600 hover:text-emerald-600">{p.name}</span>
                        </Link>
                        {user && (
                          <button
                            onClick={() => addToCart.mutate({ product_id: p.id })}
                            disabled={addToCart.isPending || !p.is_active}
                            className="text-xs bg-emerald-600 text-white rounded-lg px-2 py-1 hover:bg-emerald-700 disabled:opacity-50"
                          >
                            В корзину
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}