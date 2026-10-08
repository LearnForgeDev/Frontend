import type { CourseDto, CourseProgressDto, CourseRosterDto } from '@/Endpoints/courses';
import type { CourseDetail, CourseSummary } from '../Courses.types';
import { COURSE_ITEM_TYPES, COURSE_PROGRESS_STATUS } from './courseMapping.const';
import { getCourseProgress } from './courseFormatting';

export function toCourseSummary(course: CourseDto, progress?: CourseProgressDto): CourseSummary {
  return {
    publicId: course.publicId,
    title: course.title,
    description: course.description ?? '',
    lessonCount: course.items.filter(item => item.itemType === COURSE_ITEM_TYPES.LESSON).length,
    studentCount: null,
    completedLessonCount: progress?.completedItemsCount ?? null,
    requiredItemCount: progress?.totalRequiredItemsCount ?? course.items.filter(item => item.isRequired).length,
    progressPercent: progress ? getCourseProgress(progress.completedItemsCount, progress.totalRequiredItemsCount) : null,
  };
}

export function toCourseDetail(course: CourseDto, progress?: CourseProgressDto, roster?: CourseRosterDto): CourseDetail {
  const completed = new Set(progress?.items.filter(item => item.status === COURSE_PROGRESS_STATUS.COMPLETED).map(item => item.itemPublicId));
  return {
    ...toCourseSummary(course, progress),
    raw: course,
    canManage: course.canManage,
    studentCount: roster?.students.length ?? null,
    lessons: course.items.filter(item => item.itemType === COURSE_ITEM_TYPES.LESSON && item.lessonId !== null)
      .sort((a, b) => a.position - b.position).map(item => ({
        lessonId: item.lessonId!, itemPublicId: item.publicId, title: item.title, position: item.position,
        isRequired: item.isRequired, isCompleted: completed.has(item.publicId),
        availableFromUtc: item.availableFromUtc, availableUntilUtc: item.availableUntilUtc,
      })),
    otherItems: course.items.filter(item => item.itemType !== COURSE_ITEM_TYPES.LESSON).sort((a, b) => a.position - b.position),
    students: roster?.students.map(student => ({
      userPublicId: student.publicId, displayName: student.login,
      isDirectlyAssigned: student.isDirectlyAssigned,
      accessLabel: student.isDirectlyAssigned ? 'Назначен лично' : roster.isSchoolWide ? 'Вся школа' : 'Через группу',
      completedCount: student.progress?.completedItemsCount ?? 0,
      totalCount: roster.totalRequiredItemsCount,
      percentage: getCourseProgress(student.progress?.completedItemsCount ?? 0, roster.totalRequiredItemsCount),
    })) ?? [],
  };
}

export function canEditCourseProgram(course?: CourseDetail) {
  if (!course) return true;
  return course.otherItems.length === 0 && new Set(course.lessons.map(item => item.lessonId)).size === course.lessons.length;
}
