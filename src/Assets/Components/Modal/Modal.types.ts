export interface ModalProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  time?: number;
  disableClose?: boolean;
  onRequestClose?: () => void;
  onClose: () => void;
  children?: import('react').ReactNode;
  className?: string;
}
