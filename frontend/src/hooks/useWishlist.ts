import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Wishlist } from '../types/api'

export function useWishlist() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => (await api.get<Wishlist>('/wishlist/')).data,
    enabled: !!user,
  })
}

export function useAddToWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (productId: number) =>
      (await api.post('/wishlist/', { product_id: productId })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (productId: number) => api.delete(`/wishlist/${productId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}
