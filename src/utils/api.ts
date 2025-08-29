import Cookies from 'js-cookie';
import { ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
const TOKEN_KEY = 'upsell_agent_token';

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = Cookies.get(TOKEN_KEY);
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ApiError;
      
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred',
          timestamp: new Date(),
        };
      }

      // Handle specific error cases
      if (response.status === 401) {
        // Token expired or invalid - trigger logout
        Cookies.remove(TOKEN_KEY);
        localStorage.removeItem('upsell_agent_user');
        window.location.href = '/login';
      }

      throw new Error(errorData.message || 'Request failed');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const url = new URL(endpoint, this.baseURL);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const url = new URL(endpoint, this.baseURL);
    
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = new URL(endpoint, this.baseURL);
    
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = new URL(endpoint, this.baseURL);
    const token = Cookies.get(TOKEN_KEY);
    
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Note: Don't set Content-Type for FormData, let browser set it with boundary

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Convenience methods for common API operations
export const api = {
  // Authentication
  login: (email: string, password: string) =>
    apiClient.post('/api/auth/login', { email, password }),
  
  register: (data: {
    email: string;
    password: string;
    businessName: string;
    businessType: string;
    role: string;
  }) =>
    apiClient.post('/api/auth/register', data),

  verifyToken: () =>
    apiClient.get('/api/auth/verify'),

  refreshToken: () =>
    apiClient.post('/api/auth/refresh'),

  // File operations
  uploadFile: (file: File, metadata?: Record<string, string>) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    return apiClient.upload('/api/upload', formData);
  },

  // Training materials
  getTrainingMaterials: (filters?: Record<string, string>) =>
    apiClient.get('/api/training', filters),

  getTrainingMaterial: (id: string) =>
    apiClient.get(`/api/training/${id}`),

  processTraining: (data: {
    sessionId: string;
    productData?: Record<string, unknown>;
    trainingOptions: Record<string, unknown>;
  }) =>
    apiClient.post('/api/process', data),

  // Health check
  healthCheck: () =>
    apiClient.get('/api/health'),
};

// Error handling utilities
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

// Request interceptor for global error handling
export function setupApiErrorHandler() {
  // You can add global error handling here if needed
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason instanceof Error && event.reason.message.includes('401')) {
      // Handle authentication errors globally
      Cookies.remove(TOKEN_KEY);
      localStorage.removeItem('upsell_agent_user');
      window.location.href = '/login';
    }
  });
}

// Utility for retry logic
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }

  throw lastError!;
}

export default apiClient;