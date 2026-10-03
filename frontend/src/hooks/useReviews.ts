import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Review, ReviewSummary } from '../types/api'

export function useProductReviews(productId: number | undefined) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => (await api.get<ReviewSummary>(`/products/${productId}/reviews`)).data,
    enabled: !!productId,
  })
}

export function useCreateReview(productId: number | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { rating: number; comment?: string }) =>
      (await api.post<Review>(`/products/${productId}/reviews`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', productId] }),
  })
}

export function usePendingReviews() {
  return useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => (await api.get<Review[]>('/admin/reviews/')).data,
  })
}

export function useModerateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { id: number; status: 'APPROVED' | 'REJECTED' }) =>
      (await api.patch<Review>(`/admin/reviews/${vars.id}`, { status: vars.status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  })
}
