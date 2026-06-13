export interface ModalProps {
  title: string;
  subtitle?: string;
  icon?: string;
  time?: number;
  onClose: () => void;
}
