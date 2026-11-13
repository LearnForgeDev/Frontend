

export interface UploadItemProgress {
  id: string;
  fileName: string;
  sizeBytes?: number;
  progress: number; // 0 to 100
  status: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

export interface FileUploadProgressProps {
  items: UploadItemProgress[];
}
