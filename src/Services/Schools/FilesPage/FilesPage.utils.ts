import { FILE_EXTENSIONS, FILE_SIZE_BASE, FILE_SIZE_PRECISION, FILE_SIZE_UNITS } from './FilesPage.const';

export function getFileCategory(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() ?? '';
  return Object.entries(FILE_EXTENSIONS).find(([, extensions]) => extensions.includes(extension))?.[0] ?? 'other';
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 Б';
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(FILE_SIZE_BASE)), FILE_SIZE_UNITS.length - 1);
  return `${parseFloat((bytes / Math.pow(FILE_SIZE_BASE, unit)).toFixed(FILE_SIZE_PRECISION))} ${FILE_SIZE_UNITS[unit]}`;
}

export function formatFileDate(value: string): string {
  return new Date(value).toLocaleDateString('ru');
}
