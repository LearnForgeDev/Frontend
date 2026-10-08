import { useQuery } from '@tanstack/react-query';
import { coursesEndpoints } from '@/Endpoints/courses';
import { useToast } from '@/Storage/useToastStore';
import { canRetainCourseData, isCourseAccessError } from '../utils/courseAccess';
import { COURSE_QUERY_ERROR, COURSE_QUERY_STALE_TIME, COURSES_QUERY_ERROR } from './useCourseQueries.const';

export function useCoursesQuery(schoolPublicId: string) {
  const toast = useToast();
  const query = useQuery({
    queryKey: ['courses', schoolPublicId],
    queryFn: async () => {
      try {
        return await coursesEndpoints.getCourses(schoolPublicId);
      } catch (error) {
        toast.error(COURSES_QUERY_ERROR);
        throw error;
      }
    },
    enabled: !!schoolPublicId,
    staleTime: COURSE_QUERY_STALE_TIME,
    retry: false,
  });
  const isBlocked = query.isError && !canRetainCourseData(query.error);
  return { ...query, data: isBlocked ? undefined : query.data, isBlocked, isAccessError: isCourseAccessError(query.error) };
}

export function useCourseQuery(schoolPublicId: string, coursePublicId: string) {
  const toast = useToast();
  const query = useQuery({
    queryKey: ['courses', schoolPublicId, coursePublicId],
    queryFn: async () => {
      try {
        return await coursesEndpoints.getCourse(schoolPublicId, coursePublicId);
      } catch (error) {
        toast.error(COURSE_QUERY_ERROR);
        throw error;
      }
    },
    enabled: !!schoolPublicId && !!coursePublicId,
    staleTime: COURSE_QUERY_STALE_TIME,
    retry: false,
  });
  const isBlocked = query.isError && !canRetainCourseData(query.error);
  return { ...query, data: isBlocked ? undefined : query.data, isBlocked, isAccessError: isCourseAccessError(query.error) };
}
