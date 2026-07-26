import { create } from 'zustand';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
const logger = createDebugger('globalNotificationStore');


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

interface GlobalNotificationState {
  notifications: NotificationConfig[];
  pushNotification: (notification: NotificationConfig) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  isNotificationsEmpty: () => boolean;
}

const STORAGE_KEYS = {
  HIGH: 'high_priority_notifications',
  LOW_MED: 'low_med_priority_notifications',
};

const loadSavedNotifications = (): NotificationConfig[] => {
  try {
    const highStr = localStorage.getItem(STORAGE_KEYS.HIGH);
    const lowMedStr = sessionStorage.getItem(STORAGE_KEYS.LOW_MED);
    const high = highStr ? JSON.parse(highStr) : [];
    const lowMed = lowMedStr ? JSON.parse(lowMedStr) : [];
    return [...high, ...lowMed];
  } catch (e) {
    logger.logEventForDebug(DebugSeverity.DANGER, "Failed to load notifications from storage", e);
    return [];
  }
};

const saveNotificationsToStorage = (notifications: NotificationConfig[]) => {
  const high = notifications.filter(n => n.saveNotification && n.priority === 'high');
  const lowMed = notifications.filter(n => n.saveNotification && (n.priority === 'low' || n.priority === 'medium' || !n.priority));

  try {
    if (high.length > 0) {
      localStorage.setItem(STORAGE_KEYS.HIGH, JSON.stringify(high));
    } else {
      localStorage.removeItem(STORAGE_KEYS.HIGH);
    }
    
    if (lowMed.length > 0) {
      sessionStorage.setItem(STORAGE_KEYS.LOW_MED, JSON.stringify(lowMed));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.LOW_MED);
    }
  } catch (e) {
    logger.logEventForDebug(DebugSeverity.DANGER, "Failed to save notifications to storage", e);
  }
};

export const useGlobalNotificationStore = create<GlobalNotificationState>((set, get) => ({
  notifications: loadSavedNotifications(),
  pushNotification: (notification) => set((state) => {
    const updated = [...state.notifications, notification];
    if (notification.saveNotification) {
      saveNotificationsToStorage(updated);
    }
    return { notifications: updated };
  }),
  removeNotification: (id) => set((state) => {
    const updated = state.notifications.filter(n => n.id !== id);
    saveNotificationsToStorage(updated);
    return { notifications: updated };
  }),
  clearNotifications: () => set(() => {
    saveNotificationsToStorage([]);
    return { notifications: [] };
  }),
  isNotificationsEmpty: () => get().notifications.length === 0,
}));
