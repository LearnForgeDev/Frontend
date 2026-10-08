import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesEndpoints, type CourseDetail, type CourseLesson } from '@/Endpoints/courses';
import { useToast } from '@/Storage/useToastStore';
import type { CourseTab } from '../Courses.types';
import { useCourseQuery } from './useCourseQueries';
import { getCoursesPath, getCourseLessonPath } from '../utils/coursePath';
import { COURSE_DELETE_ERROR, COURSE_PROGRESS_ERROR } from './useCoursePage.const';

export function useCoursePage(schoolPublicId: string, coursePublicId: string) {
  const query = useCourseQuery(schoolPublicId, coursePublicId);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<CourseTab>('lessons');
  const [dialog, setDialog] = useState<'edit' | 'delete' | null>(null);
  const basePath = getCoursesPath(schoolPublicId);
  const progress = useMutation({
    mutationFn: (lesson: CourseLesson) => coursesEndpoints.setLessonProgress(
      schoolPublicId, coursePublicId, lesson.lessonId, !lesson.isCompleted,
    ),
    onSuccess: (course: CourseDetail) => {
      queryClient.setQueryData(['courses', schoolPublicId, coursePublicId], course);
      void queryClient.invalidateQueries({ queryKey: ['courses', schoolPublicId] });
    },
    onError: () => toast.error(COURSE_PROGRESS_ERROR),
  });
  const remove = useMutation({
    mutationFn: () => coursesEndpoints.deleteCourse(schoolPublicId, coursePublicId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['courses', schoolPublicId, coursePublicId] });
      void queryClient.invalidateQueries({ queryKey: ['courses', schoolPublicId] });
      toast.success('Курс удалён');
      navigate(basePath);
    },
    onError: () => toast.error(COURSE_DELETE_ERROR),
  });
  const course = query.data ? {
    ...query.data,
    lessons: [...query.data.lessons].sort((a, b) => a.position - b.position),
  } : undefined;

  return {
    query,
    course,
    tab: tab === 'students' && !course?.canManage ? 'lessons' as const : tab,
    setTab,
    dialog,
    setDialog,
    progress,
    remove,
    goBack: () => navigate(basePath),
    openLesson: (lessonId: number) => navigate(getCourseLessonPath(schoolPublicId, coursePublicId, lessonId)),
    closeDialog: () => setDialog(null),
    markLesson: (lesson: CourseLesson) => {
      if (!progress.isPending) progress.mutate(lesson);
    },
  };
}
