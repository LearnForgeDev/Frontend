import { create } from 'zustand';

export interface NotificationConfig {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  time?: number;
}

interface GlobalNotificationState {
  notifications: NotificationConfig[];
  pushNotification: (notification: NotificationConfig) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useGlobalNotificationStore = create<GlobalNotificationState>((set) => ({
  notifications: [],
  pushNotification: (notification) => set((state) => ({ notifications: [...state.notifications, notification] })),
  removeNotification: (id) => set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) })),
  clearNotifications: () => set({ notifications: [] }),
}));
