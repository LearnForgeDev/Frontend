import { useEffect } from 'react';
import type { CourseRequestStatus } from '@/Storage/Courses/courses.type';
import { useCourses } from './useCourses';

const IDLE: CourseRequestStatus = { status: 'idle' };

export function useCoursesQuery(schoolPublicId: string) {
  const feature = useCourses(schoolPublicId);
  const { read } = feature;
  const request = feature.state.requests.catalogue ?? IDLE;
  useEffect(() => {
    const refresh = () => {
      void read({ kind: 'catalogue', refresh: true });
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [read]);
  useEffect(() => {
    for (const course of feature.state.catalogue ?? []) {
      if (!course.canManage) {
        void read({ kind: 'progress', coursePublicId: course.publicId, refresh: true });
      }
    }
  }, [feature.state.catalogue, read]);
  return {
    feature, data: feature.catalogue,
    isPending: request.status === 'idle' || request.status === 'pending' && !feature.state.catalogue,
    isFetching: request.status === 'pending', isError: request.status === 'error',
    isBlocked: request.status === 'error' && request.denied,
    refetch: () => read({ kind: 'catalogue', refresh: true }),
  };
}

export function useCourseQuery(schoolPublicId: string, coursePublicId: string) {
  const feature = useCourses(schoolPublicId);
  const { read } = feature;
  const course = feature.getCourse(coursePublicId);
  const request = feature.state.requests[`course:${coursePublicId}`] ?? IDLE;
  const progress = feature.state.requests[`progress:${coursePublicId}`] ?? IDLE;
  const roster = feature.state.requests[`roster:${coursePublicId}`] ?? IDLE;
  const canManage = course?.canManage;
  useEffect(() => {
    void read({ kind: 'course', coursePublicId, refresh: true });
  }, [read, coursePublicId]);
  useEffect(() => {
    if (canManage !== undefined) {
      void read({ kind: canManage ? 'roster' : 'progress', coursePublicId, refresh: true });
    }
  }, [read, coursePublicId, canManage]);
  useEffect(() => {
    const refresh = () => {
      void read({ kind: 'course', coursePublicId, refresh: true });
      if (canManage !== undefined) {
        void read({ kind: canManage ? 'roster' : 'progress', coursePublicId, refresh: true });
      }
    };
    window.addEventListener('focus', refresh);
    const interval = window.setInterval(() => {
      if (canManage === false) {
        void read({ kind: 'progress', coursePublicId, refresh: true });
      }
    }, 15_000);
    return () => {
      window.removeEventListener('focus', refresh);
      window.clearInterval(interval);
    };
  }, [read, coursePublicId, canManage]);
  const statusView = (status: CourseRequestStatus, kind: 'progress' | 'roster') => ({
    isPending: status.status === 'idle' || status.status === 'pending',
    isError: status.status === 'error', isSuccess: status.status === 'success',
    isFetching: status.status === 'pending',
    refetch: () => read({ kind, coursePublicId, refresh: true }),
  });
  return {
    feature, data: course, isPending: request.status === 'idle' || request.status === 'pending' && !course,
    isLoading: request.status === 'idle' || request.status === 'pending' && !course,
    isFetching: request.status === 'pending', isError: request.status === 'error',
    isBlocked: request.status === 'error' && request.denied,
    refetch: () => read({ kind: 'course', coursePublicId, refresh: true }),
    progressQuery: statusView(progress, 'progress'), rosterQuery: statusView(roster, 'roster'),
  };
}
