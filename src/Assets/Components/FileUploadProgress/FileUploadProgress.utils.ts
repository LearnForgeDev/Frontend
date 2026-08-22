import type { UploadItemProgress } from './FileUploadProgress';

const BYTES_IN_KILOBYTE = 1_024;
const BYTES_IN_MEGABYTE = BYTES_IN_KILOBYTE * BYTES_IN_KILOBYTE;

export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < BYTES_IN_KILOBYTE) return `${bytes} Б`;
  if (bytes < BYTES_IN_MEGABYTE) return `${(bytes / BYTES_IN_KILOBYTE).toFixed(1)} КБ`;
  return `${(bytes / BYTES_IN_MEGABYTE).toFixed(1)} МБ`;
};

export const getUploadStatusText = (item: UploadItemProgress): string => {
  if (item.status === 'error') return item.errorMessage || 'Ошибка загрузки';
  if (item.status === 'completed') return 'Загружено';
  if (item.status === 'cancelled') return 'Загрузка отменена';
  return `${formatFileSize(item.sizeBytes)} • ${item.progress}%`;
};

export const isUploadAbortError = (error: unknown): boolean => (
  error instanceof DOMException && error.name === 'AbortError'
);
