

export interface UploadItemProgress {
  id: string;
  fileName: string;
  sizeBytes?: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'cancelled';
  errorMessage?: string;
}

export interface FileUploadProgressProps {
  items: UploadItemProgress[];
  onCancel: (uploadId: string) => void;
}
