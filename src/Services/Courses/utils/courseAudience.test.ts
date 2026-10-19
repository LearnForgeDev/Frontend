import { describe, expect, it } from 'vitest';
import type { CourseInput } from '../Courses.types';
import { getCourseAudience, getRestrictedCourseAudience } from './courseAudience';

const input: CourseInput = { title: 'Курс', description: '', lessonIds: [], studentPublicIds: [], groupIds: [], accessMode: 'selected' };

describe('Состав курса', () => {
  it('убирает прежнюю аудиторию до изменения программы, а новую добавляет только после сохранения', () => {
    expect(getRestrictedCourseAudience(
      { allowedUserPublicIds: ['old', 'teacher'], allowedGroupIds: [1] },
      { allowedUserPublicIds: ['new', 'teacher'], allowedGroupIds: [2] }, 'teacher'))
      .toEqual({ allowedUserPublicIds: ['teacher'], allowedGroupIds: [] });
  });
  it('сужает общешкольный доступ до изменения программы', () => {
    expect(getRestrictedCourseAudience(
      { allowedUserPublicIds: [], allowedGroupIds: [] },
      { allowedUserPublicIds: ['teacher', 'student'], allowedGroupIds: [] }, 'teacher'))
      .toEqual({ allowedUserPublicIds: ['teacher', 'student'], allowedGroupIds: [] });
  });
  it('не расширяет доступ до окончания сохранения', () => {
    expect(getRestrictedCourseAudience(
      { allowedUserPublicIds: ['teacher'], allowedGroupIds: [] },
      { allowedUserPublicIds: [], allowedGroupIds: [] }, 'teacher')).toBeNull();
  });
  it('оставляет курс закрытым после удаления всех учеников', () => {
    expect(getCourseAudience(input, ['student'], ['student'], 'teacher')).toEqual({ allowedUserPublicIds: ['teacher'], allowedGroupIds: [] });
  });
  it('сохраняет назначенных преподавателей и группы при изменении учеников', () => {
    expect(getCourseAudience({ ...input, studentPublicIds: ['new'], groupIds: [7] }, ['colleague', 'old'], ['old', 'new'], 'teacher'))
      .toEqual({ allowedUserPublicIds: ['colleague', 'new', 'teacher'], allowedGroupIds: [7] });
  });
  it('открывает доступ всей школе только при явном выборе', () => {
    expect(getCourseAudience({ ...input, accessMode: 'school', studentPublicIds: ['student'], groupIds: [7] }, ['teacher'], ['student'], 'teacher'))
      .toEqual({ allowedUserPublicIds: [], allowedGroupIds: [] });
  });
});
