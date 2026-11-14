

export interface DeleteEventDialogProps {
  title: string;
  dateLabel: string;
  isPending: boolean;
  hasError: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
