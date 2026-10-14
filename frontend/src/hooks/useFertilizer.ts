import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Crop, FertilizerNorm, FertilizerCalculation, AreaUnit } from '../types/api'

export function useCrops() {
  return useQuery({
    queryKey: ['fertilizer-crops'],
    queryFn: async () => (await api.get<Crop[]>('/fertilizer/crops')).data,
  })
}

export function useCropNorms(cropId: number | undefined) {
  return useQuery({
    queryKey: ['fertilizer-norms', cropId],
    queryFn: async () => (await api.get<FertilizerNorm[]>(`/fertilizer/crops/${cropId}/norms`)).data,
    enabled: !!cropId,
  })
}

export function useCalculateFertilizer() {
  return useMutation({
    mutationFn: async (vars: { cropId: number; area: number; areaUnit: AreaUnit }) =>
      (
        await api.post<FertilizerCalculation>('/fertilizer/calculate', {
          crop_id: vars.cropId,
          area: vars.area,
          area_unit: vars.areaUnit,
        })
      ).data,
  })
}