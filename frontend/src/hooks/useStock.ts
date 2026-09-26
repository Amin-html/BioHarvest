import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Stock } from '../types/api'

export function useStockForProducts(productIds: number[]) {
  return useQueries({
    queries: productIds.map((productId) => ({
      queryKey: ['stock', productId],
      queryFn: async (): Promise<Stock | null> => {
        try {
          return (await api.get<Stock>(`/admin/stock/${productId}`)).data
        } catch (e: any) {
          if (e?.response?.status === 404) return null
          throw e
        }
      },
    })),
  })
}

export function useCreateStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { product_id: number; current_stock: number }) =>
      (await api.post<Stock>('/admin/stock/', data)).data,
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['stock', vars.product_id] }),
  })
}

export function useAdjustStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { productId: number; quantity: number }) =>
      (await api.patch<Stock>(`/admin/stock/${vars.productId}/adjust`, { quantity: vars.quantity })).data,
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['stock', vars.productId] }),
  })
}