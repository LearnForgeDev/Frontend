import type { CourseCompletionRule } from '@/Endpoints/Courses';

export const COURSE_COMPLETION_OPTIONS: Record<number, { value: CourseCompletionRule; label: string }[]> = {
  0: [{ value: 1, label: 'После открытия файла' }],
  1: [
    { value: 5, label: 'После окончания занятия' },
    { value: 6, label: 'После указанного времени' },
    { value: 7, label: 'После подтверждения преподавателем' },
  ],
  2: [{ value: 2, label: 'После времени в статье' }],
  3: [
    { value: 3, label: 'После отправки задания' },
    { value: 4, label: 'После одобрения преподавателем' },
  ],
};

export const OPTIONAL_COMPLETION = { value: 0, label: 'Необязательный, без условия' } satisfies { value: CourseCompletionRule; label: string };
