import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CourseDetail } from '@/Endpoints/courses';
import { useCurrentSchool } from '@/Services/AppShell/hooks/useCurrentSchool';
import { useCoursesQuery } from './useCourseQueries';
import { getCoursePath } from '../utils/coursePath';

export function useCoursesPage(schoolPublicId: string) {
  const query = useCoursesQuery(schoolPublicId);
  const { capabilities: { canTeach } } = useCurrentSchool();
  const canManage = canTeach && !query.isBlocked;
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isEditorOpen, setEditorOpen] = useState(false);
  const normalizedSearch = search.trim().toLocaleLowerCase('ru');
  const courses = (query.data ?? []).filter(course =>
    `${course.title} ${course.description}`.toLocaleLowerCase('ru').includes(normalizedSearch),
  );

  const openCourse = (coursePublicId: string) => navigate(getCoursePath(schoolPublicId, coursePublicId));
  const onCreated = (course: CourseDetail) => {
    setEditorOpen(false);
    openCourse(course.publicId);
  };

  return {
    query,
    courses,
    canManage,
    search,
    setSearch,
    isEditorOpen,
    openEditor: () => setEditorOpen(true),
    closeEditor: () => setEditorOpen(false),
    openCourse,
    onCreated,
    hasCourses: !!query.data?.length,
    hasData: query.data !== undefined,
  };
}
