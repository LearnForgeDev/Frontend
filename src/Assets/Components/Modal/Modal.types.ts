export interface ModalProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  time?: number;
  disableClose?: boolean;
  onClose: () => void;
  children?: import('react').ReactNode;
  className?: string;
}
