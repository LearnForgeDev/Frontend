import type { CourseDto, CourseItemDto } from '@/Endpoints/Courses';
import { createCourseForm, getCourseInput } from '../hooks/courseFormReducer';
import { toCourseDetail } from './courseMapping';

export function makeCourseItem(overrides: Partial<CourseItemDto> = {}): CourseItemDto {
  return {
    id: 1, publicId: 'lesson-item', position: 0, itemType: 2, title: 'Урок', description: null,
    file: null, scheduleEventId: null, scheduleEventPublicId: null, lessonId: 10, homeworkId: null,
    completionRule: overrides.itemType === 0 ? 1 : overrides.itemType === 1 ? 5 : overrides.itemType === 3 ? 4 : 2,
    requiredSeconds: overrides.itemType === undefined || overrides.itemType === 2 ? 60 : null, completeAfterUtc: null,
    isRequired: true, availableFromUtc: null, availableUntilUtc: null, ...overrides,
  };
}

export function makeCourse(overrides: Partial<CourseDto> = {}): CourseDto {
  return {
    id: 1, publicId: 'course', title: 'Курс', description: '', authorId: 1,
    createdAt: '', updatedAt: '', canManage: true, allowedUserIds: [1],
    allowedUserPublicIds: ['teacher'], allowedGroupIds: [], items: [makeCourseItem()], ...overrides,
  };
}

export function makeCourseInput(course = makeCourse()) {
  return getCourseInput(createCourseForm(toCourseDetail(course)));
}

export function makeSupportedBlock() {
  const block = makeCourseInput().blocks[0];
  if (block.kind !== 'supported') {
    throw new Error('Expected a supported lesson fixture');
  }
  return block;
}
