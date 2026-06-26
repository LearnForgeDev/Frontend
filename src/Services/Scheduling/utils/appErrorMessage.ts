import type { AppError } from '@/Endpoints';

/**
 * Maps a normalized AppError code to user-facing copy. Centralizes the
 * FORBIDDEN/NOT_FOUND mapping shared by the scheduling mutations and the
 * join-meeting flow (extends the precedent established in useCreateCall).
 */
export function appErrorMessage(error: AppError, fallback: string): string {
  switch (error.code) {
    case 'FORBIDDEN':
      return 'You do not have permission to perform this action.';
    case 'NOT_FOUND':
      return 'The requested item no longer exists.';
    default:
      return error.message || fallback;
  }
}
