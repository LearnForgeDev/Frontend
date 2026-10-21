import type { CourseFormState } from '../Courses.types';
import { getCourseInput } from './courseFormReducer';

export function hasCourseChanges(form: CourseFormState, initial: CourseFormState) {
  return JSON.stringify(getCourseInput(form)) !== JSON.stringify(getCourseInput(initial));
}
