import { useCallback } from 'react';
import { useGlobalNotificationStore } from '../../../Storage/globalNotificationStore';
import type { NotificationConfig } from '../../../Storage/globalNotificationStore';

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export function useNotification() {
  const pushNotification = useGlobalNotificationStore((state) => state.pushNotification);
  const clearNotifications = useGlobalNotificationStore((state) => state.clearNotifications);
  const isNotificationsEmpty = useGlobalNotificationStore((state) => state.isNotificationsEmpty);

  const createNotification = useCallback((
    title: string, 
    subtitle?: string, 
    icon?: string, 
    time: number = 3000, 
    saveNotification: boolean = false, 
    priority?: 'low' | 'medium' | 'high'
  ) => {
    const newNotification: NotificationConfig = {
      id: generateId(),
      title,
      subtitle,
      icon,
      time,
      saveNotification,
      priority,
    };
    pushNotification(newNotification);
  }, [pushNotification]);

  const clearAllNotification = useCallback(() => {
    clearNotifications();
  }, [clearNotifications]);

  return { createNotification, clearAllNotification, isNotificationsEmpty };
}
