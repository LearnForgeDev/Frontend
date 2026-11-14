

export interface FileSelectorModalProps {
  open: boolean;
  onClose: () => void;
  schoolPublicId: string;
  onSelectFiles: (selectedFiles: Array<{ publicId: string; fileName: string }>) => void;
}
