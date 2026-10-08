import type { CourseDetail, CourseInput } from '@/Endpoints/courses';
import type { CourseFormState } from '../Courses.types';

type CourseFormAction =
  | { type: 'field'; field: 'title' | 'description'; value: string }
  | { type: 'lessons'; lessonIds: number[] }
  | { type: 'students'; studentPublicIds: string[] }
  | { type: 'move'; lessonId: number; direction: -1 | 1 }
  | { type: 'error'; error: string | null };

export function createCourseForm(course?: CourseDetail): CourseFormState {
  return {
    title: course?.title ?? '',
    description: course?.description ?? '',
    lessonIds: [...course?.lessons ?? []].sort((a, b) => a.position - b.position).map(lesson => lesson.lessonId),
    studentPublicIds: course?.students.map(student => student.userPublicId) ?? [],
    error: null,
  };
}

export function courseFormReducer(state: CourseFormState, action: CourseFormAction): CourseFormState {
  if (action.type === 'field') return { ...state, [action.field]: action.value, error: null };
  if (action.type === 'lessons') return { ...state, lessonIds: action.lessonIds, error: null };
  if (action.type === 'students') return { ...state, studentPublicIds: action.studentPublicIds, error: null };
  if (action.type === 'error') return { ...state, error: action.error };
  const index = state.lessonIds.indexOf(action.lessonId);
  const nextIndex = index + action.direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= state.lessonIds.length) return state;
  const lessonIds = [...state.lessonIds];
  [lessonIds[index], lessonIds[nextIndex]] = [lessonIds[nextIndex], lessonIds[index]];
  return { ...state, lessonIds };
}

export function getCourseInput(state: CourseFormState): CourseInput {
  return {
    title: state.title.trim(),
    description: state.description.trim(),
    lessonIds: state.lessonIds,
    studentPublicIds: state.studentPublicIds,
  };
}
