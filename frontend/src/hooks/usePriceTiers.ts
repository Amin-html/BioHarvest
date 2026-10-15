import { useQueries, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { PriceTier } from '../types/api'

export function usePriceTiers(productId: number | undefined) {
  return useQuery({
    queryKey: ['price-tiers', productId],
    queryFn: async () => (await api.get<PriceTier[]>(`/products/${productId}/price-tiers`)).data,
    enabled: !!productId,
  })
}

export function usePriceTiersForProducts(productIds: number[]) {
  return useQueries({
    queries: productIds.map((productId) => ({
      queryKey: ['price-tiers', productId],
      queryFn: async () => (await api.get<PriceTier[]>(`/products/${productId}/price-tiers`)).data,
    })),
  })
}

// Эффективная цена за единицу для заданного количества — та же логика,
// что и на бэкенде: самый высокий порог min_quantity, не превышающий quantity.
export function effectiveUnitPrice(tiers: PriceTier[] | undefined, quantity: number, retailPrice: number): number {
  if (!tiers || tiers.length === 0) return retailPrice
  const applicable = tiers
    .filter((t) => t.min_quantity <= quantity)
    .sort((a, b) => b.min_quantity - a.min_quantity)[0]
  return applicable ? applicable.unit_price : retailPrice
}

export function useCreatePriceTier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { productId: number; min_quantity: number; unit_price: number }) =>
      (
        await api.post<PriceTier>(`/admin/price-tiers/products/${vars.productId}`, {
          min_quantity: vars.min_quantity,
          unit_price: vars.unit_price,
        })
      ).data,
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['price-tiers', vars.productId] }),
  })
}

export function useUpdatePriceTier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { tierId: number; productId: number; data: Partial<Pick<PriceTier, 'min_quantity' | 'unit_price'>> }) =>
      (await api.patch<PriceTier>(`/admin/price-tiers/${vars.tierId}`, vars.data)).data,
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['price-tiers', vars.productId] }),
  })
}

export function useDeletePriceTier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { tierId: number; productId: number }) =>
      api.delete(`/admin/price-tiers/${vars.tierId}`),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['price-tiers', vars.productId] }),
  })
}