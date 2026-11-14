import type { PillChoice } from '@/Assets/Components/PillButtonGroup/PillButtonGroup.type';
import type { CourseTab } from '../../Courses.type';

export const MANAGER_COURSE_TABS: PillChoice<CourseTab>[] = [
  { label: 'Уроки', value: 'lessons' },
  { label: 'Ученики', value: 'students' },
  { label: 'Прогресс', value: 'progress' },
];
export const STUDENT_COURSE_TABS: PillChoice<CourseTab>[] = [
  { label: 'Уроки', value: 'lessons' },
  { label: 'Мой прогресс', value: 'progress' },
];
