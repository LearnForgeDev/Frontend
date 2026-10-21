import { LESSON_TITLE_MAX_LENGTH } from './lessonTitle.const';

export function validateLessonTitle(title: string): string | null {
  if (!title.trim()) return 'Введите название урока';
  if (title.trim().length > LESSON_TITLE_MAX_LENGTH) return `Название не должно превышать ${LESSON_TITLE_MAX_LENGTH} символов`;
  return null;
}
