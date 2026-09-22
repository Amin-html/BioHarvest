import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Order } from '../types/api'

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => (await api.get<Order[]>('/admin/orders/')).data,
  })
}

export function useAdminUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { orderId: number; status: string }) =>
      (await api.patch<Order>(`/admin/orders/${vars.orderId}/status`, { status: vars.status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  })
}