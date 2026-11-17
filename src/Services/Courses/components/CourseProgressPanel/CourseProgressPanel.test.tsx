import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { makeCourse, makeCourseItem } from '../../utils/course.fixtures';
import { toCourseDetail } from '../../utils/courseMapping';
import CourseProgressPanel from './CourseProgressPanel';

afterEach(cleanup);

it('lets a teacher confirm an unlocked manual step for one student and reset its completion', () => {
  const course = toCourseDetail(makeCourse({ items: [makeCourseItem({ itemType: 1, completionRule: 7, requiredSeconds: null, scheduleEventPublicId: 'event' })] }), undefined, {
    coursePublicId: 'course', isSchoolWide: false, totalRequiredItemsCount: 1,
    students: [{ publicId: 'student', login: 'Ученик', avatarUrl: null, isDirectlyAssigned: true, accessGroupIds: [], progress: {
      coursePublicId: 'course', completedItemsCount: 0, totalRequiredItemsCount: 1, percent: 0, startedAt: '', lastActivityAt: '', completedAt: null,
      items: [{ itemPublicId: 'lesson-item', position: 0, status: 0, startedAt: '', completedAt: null, elapsedSeconds: 0, isUnlocked: true }],
    } }],
  });
  const approve = vi.fn();
  const props = { course, isApproving: false, onApproveItem: approve };
  const view = render(<CourseProgressPanel {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Подтвердить «Урок» для Ученик' }));
  expect(approve).toHaveBeenCalledWith('student', course.items[0], 2);
  course.students[0].items[0].isCompleted = true;
  view.rerender(<CourseProgressPanel {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Сбросить «Урок» для Ученик' }));
  expect(approve).toHaveBeenLastCalledWith('student', course.items[0], 0);
  course.students[0].items[0].isCompleted = false;
  course.students[0].items[0].isUnlocked = false;
  view.rerender(<CourseProgressPanel {...props} />);
  expect(screen.getByRole('button', { name: 'Подтвердить «Урок» для Ученик' }).hasAttribute('disabled')).toBe(true);
});
