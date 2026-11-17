import type { CourseInput } from '@/Services/Courses/Courses.type';
import { COURSE_DESCRIPTION_MAX_LENGTH, COURSE_LESSON_MAX_COUNT, COURSE_STUDENT_MAX_COUNT, COURSE_TITLE_MAX_LENGTH } from './courseValidation.const';

export function validateCourse(input: CourseInput): string | null {
  if (!input.title.trim()) {
    return 'Введите название курса';
  }
  if (input.title.trim().length > COURSE_TITLE_MAX_LENGTH) {
    return `Название не должно превышать ${COURSE_TITLE_MAX_LENGTH} символов`;
  }
  if (input.description.length > COURSE_DESCRIPTION_MAX_LENGTH) {
    return `Описание не должно превышать ${COURSE_DESCRIPTION_MAX_LENGTH} символов`;
  }
  if (input.blocks.length > COURSE_LESSON_MAX_COUNT) {
    return `В курсе может быть не больше ${COURSE_LESSON_MAX_COUNT} блоков`;
  }
  if (new Set(input.blocks.map(block => block.clientId)).size !== input.blocks.length) {
    return 'В программе есть повторяющиеся идентификаторы блоков';
  }
  for (const block of input.blocks) {
    if (block.kind === 'unsupported') {
      continue;
    }
    if (!block.input.title.trim()) {
      return 'Введите название каждого блока';
    }
    if (block.input.completionRule === 2 && (!Number.isInteger(block.input.requiredSeconds) || (block.input.requiredSeconds ?? 0) < 1 || (block.input.requiredSeconds ?? 0) > 86400)) {
      return 'Укажите время в статье: от одной секунды до суток';
    }
    if (block.input.completionRule === 6 && (!block.input.completeAfterUtc || !Number.isFinite(Date.parse(block.input.completeAfterUtc)))) {
      return 'Укажите время прохождения занятия';
    }
    const { availableFromUtc, availableUntilUtc } = block.input;
    if ((availableFromUtc && !Number.isFinite(Date.parse(availableFromUtc))) || (availableUntilUtc && !Number.isFinite(Date.parse(availableUntilUtc)))) {
      return 'Проверьте даты доступности блоков';
    }
    if (availableFromUtc && availableUntilUtc && Date.parse(availableFromUtc) >= Date.parse(availableUntilUtc)) {
      return 'Начало доступности блока должно быть раньше окончания';
    }
  }
  if (input.studentPublicIds.length > COURSE_STUDENT_MAX_COUNT) {
    return `В курсе может быть не больше ${COURSE_STUDENT_MAX_COUNT} учеников`;
  }
  return null;
}
