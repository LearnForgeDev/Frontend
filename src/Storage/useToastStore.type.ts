import type { ToastSeverity } from './useToastStore';

export interface ToastMessage {
  id: string;
  message: string;
  severity: ToastSeverity;
  visible?: boolean;
}

export interface ToastState {
  toasts: ToastMessage[];
  addToast: (message: string, severity: ToastSeverity) => void;
  removeToast: (id: string) => void;
}
