import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Product, ProductImage } from '../types/api'

export interface ProductCreateInput {
  name: string
  slug: string
  price: number
  category_id: number
  description?: string
  is_active?: boolean
}

export type ProductUpdateInput = Partial<ProductCreateInput>

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: ProductCreateInput) =>
      (await api.post<Product>('/products/', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { id: number; data: ProductUpdateInput }) =>
      (await api.patch<Product>(`/products/${vars.id}`, vars.data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}
export function useAddProductImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { productId: number; url: string; position?: number; is_primary?: boolean }) =>
      (await api.post<ProductImage>(`/products/${vars.productId}/images`, {
        url: vars.url,
        position: vars.position ?? 0,
        is_primary: vars.is_primary ?? false,
      })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product'] })
    },
  })
}

export function useDeleteProductImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (imageId: number) => api.delete(`/products/images/${imageId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product'] })
    },
  })
}