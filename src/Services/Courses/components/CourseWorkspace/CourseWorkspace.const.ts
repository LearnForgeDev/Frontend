import type { PillChoice } from '@/Assets/Components/PillButtonGroup/PillButtonGroup.types';
import type { CourseTab } from '../../Courses.types';

export const MANAGER_COURSE_TABS: PillChoice<CourseTab>[] = [
  { label: 'Уроки', value: 'lessons' },
  { label: 'Ученики', value: 'students' },
  { label: 'Прогресс', value: 'progress' },
];
export const STUDENT_COURSE_TABS: PillChoice<CourseTab>[] = [
  { label: 'Уроки', value: 'lessons' },
  { label: 'Мой прогресс', value: 'progress' },
];
