import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Order, DeliveryMethod } from '../types/api'

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => (await api.get<Order[]>('/orders/')).data,
  })
}

export function useDeliveryMethods() {
  return useQuery({
    queryKey: ['delivery-methods'],
    queryFn: async () => (await api.get<DeliveryMethod[]>('/delivery/methods/')).data,
  })
}

export function useCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { deliveryMethodId?: number; promoCode?: string }) => {
      const params = new URLSearchParams()
      if (vars.deliveryMethodId) params.set('delivery_method_id', String(vars.deliveryMethodId))
      if (vars.promoCode) params.set('promo_code', vars.promoCode)
      const { data } = await api.post<Order>(`/orders/?${params.toString()}`, null, {
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['cart'] })
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useCancelOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (orderId: number) =>
      (await api.post<Order>(`/orders/${orderId}/cancel`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}