

export interface NotificationConfig {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  time?: number;
  priority?: 'low' | 'medium' | 'high';
  saveNotification?: boolean;
  shouldDisplayGlobally?: boolean;
}

export interface GlobalNotificationState {
  notifications: NotificationConfig[];
  pushNotification: (notification: NotificationConfig) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  isNotificationsEmpty: () => boolean;
}
