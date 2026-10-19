import { describe, expect, it } from 'vitest';
import type { CourseDto, CourseProgressDto, CourseRosterDto } from '@/Endpoints/courses';
import { canEditCourseProgram, toCourseDetail } from './courseMapping';
import { createCourseForm } from '../hooks/courseFormReducer';

const course: CourseDto = {
  id: 1, publicId: 'course', title: 'Курс', description: null, authorId: 1, createdAt: '', updatedAt: '',
  canManage: true, allowedUserIds: [1], allowedUserPublicIds: ['teacher'], allowedGroupIds: [7],
  items: [{ id: 2, publicId: 'item', title: 'Урок', description: null, position: 0, itemType: 2, lessonId: 10,
    file: null, scheduleEventId: null, homeworkId: null, isRequired: true, availableFromUtc: null, availableUntilUtc: null }],
};
const progress: CourseProgressDto = {
  coursePublicId: 'course', completedItemsCount: 1, totalRequiredItemsCount: 2, percent: 50,
  startedAt: '', lastActivityAt: '', completedAt: null,
  items: [{ itemPublicId: 'item', position: 0, status: 2, startedAt: '', completedAt: '' }],
};

describe('Контракт курсов feature/new-fun', () => {
  it('связывает прогресс по GUID элемента и сохраняет серверный знаменатель', () => {
    const detail = toCourseDetail(course, progress);
    expect(detail.lessons[0].isCompleted).toBe(true);
    expect(detail.requiredItemCount).toBe(2);
    expect(detail.progressPercent).toBe(50);
    expect(toCourseDetail(course).completedLessonCount).toBeNull();
  });
  it('не превращает групповой доступ в прямое назначение после открытия редактора', () => {
    const roster: CourseRosterDto = { coursePublicId: 'course', isSchoolWide: false, totalRequiredItemsCount: 1,
      students: [{ publicId: 'student', login: 'Ученик', avatarUrl: null, isDirectlyAssigned: false, accessGroupIds: [7], progress: null }] };
    const form = createCourseForm(toCourseDetail(course, undefined, roster));
    expect(form.studentPublicIds).toEqual(['teacher']);
    expect(form.groupIds).toEqual([7]);
    expect(form.accessMode).toBe('selected');
  });
  it('не редактирует смешанную программу как список уроков', () => {
    const detail = toCourseDetail({ ...course, items: [{ ...course.items[0], itemType: 0, lessonId: null }] });
    expect(detail.otherItems).toHaveLength(1);
    expect(canEditCourseProgram(detail)).toBe(false);
  });
});
