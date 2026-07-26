import { create } from 'zustand';
import { createUUID } from '@/Assets/globalUtils';

const TOAST_VISIBILITY_TIME = 5000;

export enum ToastSeverity {
  SUCCESS = 0,
  WARNING = 1,
  ERROR = 2,
}

export interface ToastMessage {
  id: string;
  message: string;
  severity: ToastSeverity;
  visible?: boolean;
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (message: string, severity: ToastSeverity) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, severity) => {
    const id = createUUID();
    set((state) => ({
      toasts: [...state.toasts, { id, message, severity, visible: true }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.map((t) => t.id === id ? { ...t, visible: false } : t),
      }));
      
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, 500);
    }, TOAST_VISIBILITY_TIME);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);
  return {
    success: (msg: string) => addToast(msg, ToastSeverity.SUCCESS),
    warning: (msg: string) => addToast(msg, ToastSeverity.WARNING),
    error: (msg: string) => addToast(msg, ToastSeverity.ERROR),
  };
};

// Break circular dependency by dynamically importing the container
// after the store's exports are fully defined.
if (typeof window !== 'undefined') {
  import('@/Assets/Components/GlobalToastContainer/GlobalToastContainer');
}

