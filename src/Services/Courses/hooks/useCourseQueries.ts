import { useQueries, useQuery } from '@tanstack/react-query';
import { coursesEndpoints } from '@/Endpoints/courses';
import { useToast } from '@/Storage/useToastStore';
import { canRetainCourseData, isCourseAccessError } from '../utils/courseAccess';
import { toCourseDetail, toCourseSummary } from '../utils/courseMapping';
import { COURSE_QUERY_ERROR, COURSE_QUERY_STALE_TIME, COURSES_QUERY_ERROR, COURSE_ROSTER_QUERY_ERROR, COURSE_PROGRESS_QUERY_ERROR } from './useCourseQueries.const';

export function useCoursesQuery(schoolPublicId: string) {
  const toast = useToast();
  const query = useQuery({
    queryKey: ['courses', schoolPublicId],
    queryFn: async () => {
      try { return await coursesEndpoints.getCourses(schoolPublicId); }
      catch (error) { toast.error(COURSES_QUERY_ERROR); throw error; }
    },
    enabled: !!schoolPublicId, staleTime: COURSE_QUERY_STALE_TIME, retry: false,
  });
  const isBlocked = query.isError && !canRetainCourseData(query.error);
  const courses = isBlocked ? undefined : query.data;
  const progress = useQueries({ queries: (courses ?? []).map(course => ({
    queryKey: ['course-progress', schoolPublicId, course.publicId],
    queryFn: () => coursesEndpoints.getProgress(schoolPublicId, course.publicId),
    enabled: !course.canManage, staleTime: COURSE_QUERY_STALE_TIME, retry: false,
  })) });
  return { ...query, data: courses?.map((course, index) => toCourseSummary(course, progress[index]?.isError ? undefined : progress[index]?.data)), isBlocked, isAccessError: isCourseAccessError(query.error) };
}

export function useCourseQuery(schoolPublicId: string, coursePublicId: string) {
  const toast = useToast();
  const query = useQuery({
    queryKey: ['courses', schoolPublicId, coursePublicId],
    queryFn: async () => {
      try { return await coursesEndpoints.getCourse(schoolPublicId, coursePublicId); }
      catch (error) { toast.error(COURSE_QUERY_ERROR); throw error; }
    },
    enabled: !!schoolPublicId && !!coursePublicId, staleTime: COURSE_QUERY_STALE_TIME, retry: false,
  });
  const isBlocked = query.isError && !canRetainCourseData(query.error);
  const course = isBlocked ? undefined : query.data;
  const progressQuery = useQuery({
    queryKey: ['course-progress', schoolPublicId, coursePublicId],
    queryFn: async () => {
      try { return await coursesEndpoints.getProgress(schoolPublicId, coursePublicId); }
      catch (error) { toast.error(COURSE_PROGRESS_QUERY_ERROR); throw error; }
    },
    enabled: !!course && !course.canManage, staleTime: COURSE_QUERY_STALE_TIME, retry: false,
  });
  const rosterQuery = useQuery({
    queryKey: ['course-roster', schoolPublicId, coursePublicId],
    queryFn: async () => {
      try { return await coursesEndpoints.getRoster(schoolPublicId, coursePublicId); }
      catch (error) { toast.error(COURSE_ROSTER_QUERY_ERROR); throw error; }
    },
    enabled: !!course?.canManage, staleTime: COURSE_QUERY_STALE_TIME, retry: false,
  });
  return {
    ...query,
    data: course ? toCourseDetail(course,
      progressQuery.isError ? undefined : progressQuery.data,
      course.canManage && !rosterQuery.isError ? rosterQuery.data : undefined) : undefined,
    progressQuery, rosterQuery, isBlocked, isAccessError: isCourseAccessError(query.error),
  };
}
