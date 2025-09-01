import useSWR from 'swr';
import { api } from '@/utils/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'completed' | 'processing' | 'error';
  timestamp: string;
  isRead: boolean;
  createdAt: Date;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export function useNotifications() {
  const { data, error, mutate, isLoading } = useSWR<NotificationsResponse>(
    '/api/notifications',
    async (url: string) => {
      const response = await api.get<NotificationsResponse>(url);
      return response;
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    isLoading,
    error,
    mutate,
  };
}