import type { ReactNode } from 'react';
export interface ModalProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  time?: number;
  disableClose?: boolean;
  onRequestClose?: () => void;
  onClose: () => void;
  children?: ReactNode;
  className?: string;
}
