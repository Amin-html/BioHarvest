import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Category } from '../types/api'

export interface CategoryCreateInput {
  name: string
  slug: string
}
export type CategoryUpdateInput = Partial<CategoryCreateInput>

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CategoryCreateInput) =>
      (await api.post<Category>('/categories/', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { id: number; data: CategoryUpdateInput }) =>
      (await api.patch<Category>(`/categories/${vars.id}`, vars.data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}