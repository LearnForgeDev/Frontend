import type { AppError } from '@/Endpoints';

/**
 * Maps a normalized AppError code to user-facing copy. Centralizes the
 * FORBIDDEN/NOT_FOUND mapping shared by the scheduling mutations and the
 * join-meeting flow (extends the precedent established in useCreateCall).
 */
export function appErrorMessage(error: AppError, fallback: string): string {
  switch (error.code) {
    case 'FORBIDDEN':
      return 'У вас нет доступа к этому действию.';
    case 'NOT_FOUND':
      return 'Запрошенный объект больше не существует.';
    default:
      return fallback;
  }
}
