export interface NotificationProps {
  title: string;
  subtitle?: string;
  icon?: string;
  time?: number;
  onClose: () => void;
}
