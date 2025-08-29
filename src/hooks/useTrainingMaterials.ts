import useSWR from 'swr';
import { api } from '@/utils/api';
import { TrainingMaterial } from '@/types';

export function useTrainingMaterials(filters?: Record<string, string>) {
  const { data, error, mutate, isLoading } = useSWR(
    ['/api/training', filters],
    ([url, params]) => api.getTrainingMaterials(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    materials: data?.trainingMaterials || [],
    isLoading,
    error,
    mutate,
  };
}

export function useTrainingMaterial(id: string) {
  const { data, error, mutate, isLoading } = useSWR(
    id ? `/api/training/${id}` : null,
    () => api.getTrainingMaterial(id),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    material: data,
    isLoading,
    error,
    mutate,
  };
}