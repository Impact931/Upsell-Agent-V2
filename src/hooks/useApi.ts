import { useState, useCallback } from 'react';
import { api, handleApiError } from '@/utils/api';
import { toast } from 'react-hot-toast';

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useApi() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const request = useCallback(async (
    key: string,
    method: ApiMethod,
    endpoint: string,
    data?: any,
    options: UseApiOptions = {}
  ) => {
    const {
      showSuccessToast = false,
      showErrorToast = true,
      successMessage,
      onSuccess,
      onError,
    } = options;

    setLoading(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: '' }));

    try {
      let result;
      
      switch (method) {
        case 'GET':
          result = await api.get(endpoint, data);
          break;
        case 'POST':
          result = await api.post(endpoint, data);
          break;
        case 'PUT':
          result = await api.put(endpoint, data);
          break;
        case 'DELETE':
          result = await api.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (showSuccessToast) {
        toast.success(successMessage || 'Operation completed successfully');
      }

      onSuccess?.(result);
      return result;

    } catch (error) {
      const errorMessage = handleApiError(error);
      setErrors(prev => ({ ...prev, [key]: errorMessage }));

      if (showErrorToast) {
        toast.error(errorMessage);
      }

      onError?.(error instanceof Error ? error : new Error(errorMessage));
      throw error;

    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const get = useCallback((
    key: string, 
    endpoint: string, 
    params?: any, 
    options?: UseApiOptions
  ) => {
    return request(key, 'GET', endpoint, params, options);
  }, [request]);

  const post = useCallback((
    key: string, 
    endpoint: string, 
    data?: any, 
    options?: UseApiOptions
  ) => {
    return request(key, 'POST', endpoint, data, options);
  }, [request]);

  const put = useCallback((
    key: string, 
    endpoint: string, 
    data?: any, 
    options?: UseApiOptions
  ) => {
    return request(key, 'PUT', endpoint, data, options);
  }, [request]);

  const del = useCallback((
    key: string, 
    endpoint: string, 
    options?: UseApiOptions
  ) => {
    return request(key, 'DELETE', endpoint, undefined, options);
  }, [request]);

  const isLoading = useCallback((key: string) => loading[key] || false, [loading]);
  const getError = useCallback((key: string) => errors[key] || '', [errors]);

  const clearError = useCallback((key: string) => {
    setErrors(prev => ({ ...prev, [key]: '' }));
  }, []);

  return {
    get,
    post,
    put,
    delete: del,
    isLoading,
    getError,
    clearError,
  };
}

// Specialized hooks for common operations
export function useTrainingApi() {
  const api = useApi();

  const generateTraining = useCallback((sessionId: string, options: any) => {
    return api.post('generateTraining', '/api/process', {
      sessionId,
      trainingOptions: options,
    }, {
      showSuccessToast: true,
      successMessage: 'Training materials generated successfully!',
    });
  }, [api]);

  const updateTrainingMaterial = useCallback((id: string, data: any) => {
    return api.put(`updateTraining-${id}`, `/api/training/${id}`, data, {
      showSuccessToast: true,
      successMessage: 'Training material updated successfully!',
    });
  }, [api]);

  const deleteTrainingMaterial = useCallback(async (id: string) => {
    try {
      const result = await api.delete(`/api/training/${id}`);
      // Show success toast manually since the delete method doesn't support options
      toast.success('Training material deleted successfully!');
      return result;
    } catch (error) {
      toast.error('Failed to delete training material');
      throw error;
    }
  }, [api]);

  return {
    generateTraining,
    updateTrainingMaterial,
    deleteTrainingMaterial,
    isGenerating: api.isLoading('generateTraining'),
    isUpdating: (id: string) => api.isLoading(`updateTraining-${id}`),
    isDeleting: (id: string) => api.isLoading(`deleteTraining-${id}`),
    getError: api.getError,
    clearError: api.clearError,
  };
}

export function useHealthCheck() {
  const api = useApi();

  const checkHealth = useCallback(() => {
    return api.get('healthCheck', '/api/health');
  }, [api]);

  return {
    checkHealth,
    isChecking: api.isLoading('healthCheck'),
    error: api.getError('healthCheck'),
    clearError: () => api.clearError('healthCheck'),
  };
}