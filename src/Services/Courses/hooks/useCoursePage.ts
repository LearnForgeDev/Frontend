import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesEndpoints } from '@/Endpoints/courses';
import { useToast } from '@/Storage/useToastStore';
import type { CourseLesson, CourseTab } from '../Courses.types';
import { useCourseQuery } from './useCourseQueries';
import { getCoursesPath, getCourseLessonPath } from '../utils/coursePath';
import { COURSE_DELETE_ERROR, COURSE_PROGRESS_ERROR } from './useCoursePage.const';
import { COURSE_PROGRESS_STATUS } from '../utils/courseMapping.const';

export function useCoursePage(schoolPublicId: string, coursePublicId: string) {
  const query = useCourseQuery(schoolPublicId, coursePublicId);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<CourseTab>('lessons');
  const [dialog, setDialog] = useState<'edit' | 'delete' | null>(null);
  const basePath = getCoursesPath(schoolPublicId);
  const progress = useMutation({
    mutationFn: (lesson: CourseLesson) => coursesEndpoints.setItemProgress(
      schoolPublicId, coursePublicId, lesson.itemPublicId,
      lesson.isCompleted ? COURSE_PROGRESS_STATUS.NOT_STARTED : COURSE_PROGRESS_STATUS.COMPLETED,
    ),
    onSuccess: saved => queryClient.setQueryData(['course-progress', schoolPublicId, coursePublicId], saved),
    onError: () => toast.error(COURSE_PROGRESS_ERROR),
  });
  const remove = useMutation({
    mutationFn: () => coursesEndpoints.deleteCourse(schoolPublicId, coursePublicId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['courses', schoolPublicId, coursePublicId] });
      queryClient.removeQueries({ queryKey: ['course-progress', schoolPublicId, coursePublicId] });
      queryClient.removeQueries({ queryKey: ['course-roster', schoolPublicId, coursePublicId] });
      void queryClient.invalidateQueries({ queryKey: ['courses', schoolPublicId] });
      toast.success('Курс удалён');
    },
    onError: () => toast.error(COURSE_DELETE_ERROR),
  });
  const course = query.data;
  const openLesson = (lessonId: number) => navigate(getCourseLessonPath(schoolPublicId, coursePublicId, lessonId));
  return {
    query, course, audienceQuery: course?.canManage ? query.rosterQuery : query.progressQuery,
    tab: tab === 'students' && !course?.canManage ? 'lessons' as const : tab,
    setTab, dialog, setDialog, progress, remove,
    deleteCourse: () => remove.mutate(undefined, { onSuccess: () => navigate(basePath) }),
    goBack: () => navigate(basePath), openLesson,
    closeDialog: () => setDialog(null),
    markLesson: (lesson: CourseLesson) => {
      if (!progress.isPending && query.progressQuery.isSuccess) progress.mutate(lesson);
    },
  };
}
