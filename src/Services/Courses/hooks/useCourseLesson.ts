import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCourseTime } from './useCourseTime';
import { useCourseQuery } from './useCourseQueries';
import { isCourseItemAvailable } from '../utils/courseProgram.conversion';

export function useCourseLesson(schoolPublicId: string, coursePublicId: string, lessonId: string) {
  const courseQuery = useCourseQuery(schoolPublicId, coursePublicId);
  const [search] = useSearchParams();
  const itemPublicId = search.get('item');
  const { feature } = courseQuery;
  const { read } = feature;
  const lesson = courseQuery.data?.lessons.find(item => String(item.lessonId) === lessonId && (!itemPublicId || item.itemPublicId === itemPublicId));
  const available = lesson && (courseQuery.data?.canManage || lesson.isUnlocked && isCourseItemAvailable(lesson));
  const selectedItemId = available ? lesson.itemPublicId : undefined;
  const selectedLessonId = available ? lesson.lessonId : undefined;
  const request = feature.state.requests[`lesson:${coursePublicId}:${selectedItemId ?? ''}`];
  useEffect(() => {
    if (selectedItemId && selectedLessonId !== undefined) {
      void read({ kind: 'lesson', coursePublicId, itemPublicId: selectedItemId, lessonId: selectedLessonId, refresh: true });
    }
  }, [read, coursePublicId, selectedItemId, selectedLessonId]);
  const content = selectedItemId ? feature.state.lessons[selectedItemId] : undefined;
  const timingError = useCourseTime({
    coursePublicId, itemPublicId: selectedItemId,
    enabled: Boolean(available && !courseQuery.data?.canManage && lesson.completionRule === 2 && !lesson.isCompleted && content && request?.status === 'success'),
    activity: feature.activity,
  });
  return {
    timingError,
    course: courseQuery.data, lesson: available ? lesson : undefined,
    content,
    isLoading: courseQuery.isLoading || Boolean(available && (!request || request.status === 'pending')),
    isError: courseQuery.isError || request?.status === 'error',
    isRetrying: courseQuery.isFetching || request?.status === 'pending',
    retry: () => selectedItemId && selectedLessonId !== undefined
      ? read({ kind: 'lesson', coursePublicId, itemPublicId: selectedItemId, lessonId: selectedLessonId, refresh: true })
      : courseQuery.refetch(),
  };
}
