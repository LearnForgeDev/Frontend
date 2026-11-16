import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/Storage/useToastStore';
import type { CourseProgramItem, CourseTab } from '../Courses.type';
import type { CourseMaterialPreview } from './useCoursePage.type';
import { useCourseQuery } from './useCourseQueries';
import { getCoursesPath, getCourseLessonPath } from '../utils/coursePath';
import { isCourseItemAvailable } from '../utils/courseProgram.conversion';

export function useCoursePage(schoolPublicId: string, coursePublicId: string) {
  const query = useCourseQuery(schoolPublicId, coursePublicId);
  const { feature } = query;
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const toast = useToast();
  const [tab, setTab] = useState<CourseTab>('lessons');
  const [dialog, setDialog] = useState<'edit' | 'delete' | null>(null);
  const [progressError, setProgressError] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const [openingItemPublicId, setOpeningItemPublicId] = useState<string | null>(null);
  const [material, setMaterial] = useState<CourseMaterialPreview | null>(null);
  const materialUrl = useRef<string | null>(null);
  const openSequence = useRef(0);
  const basePath = getCoursesPath(schoolPublicId);
  const closeMaterial = useCallback(() => {
    openSequence.current += 1;
    if (materialUrl.current) {
      URL.revokeObjectURL(materialUrl.current);
      materialUrl.current = null;
    }
    setMaterial(null);
    setOpeningItemPublicId(null);
  }, []);
  useEffect(() => {
    return () => {
      openSequence.current += 1;
      if (materialUrl.current) {
        URL.revokeObjectURL(materialUrl.current);
        materialUrl.current = null;
      }
    };
  }, [schoolPublicId, coursePublicId, feature.scope]);
  const course = query.data;
  const openItem = async (item: CourseProgramItem) => {
    if (item.block.kind !== 'supported' || !course || !course.canManage && !isCourseItemAvailable(item)) {
      return;
    }
    setOpenError(null);
    const reference = item.block.input;
    if (reference.itemType === 2) {
      navigate(getCourseLessonPath(schoolPublicId, coursePublicId, reference.lessonId, item.publicId));
    } else if (reference.itemType === 1) {
      if (!('scheduleEventPublicId' in reference) || !reference.scheduleEventPublicId) {
        setOpenError('Занятие недоступно. Обратитесь к преподавателю.');
        return;
      }
      const search = new URLSearchParams({ eventId: reference.scheduleEventPublicId });
      navigate(`/app/schools/${encodeURIComponent(schoolPublicId)}/schedule?${search.toString()}`);
    } else if (reference.itemType === 3) {
      const path = feature.getHomeworkPath(reference.homeworkId, coursePublicId, item.publicId);
      if (path) {
        navigate(path);
      } else {
        setOpenError('Задание недоступно для вашего аккаунта. Обратитесь к преподавателю или обновите курс.');
        void feature.homework.refresh();
      }
    } else {
      const sequence = ++openSequence.current;
      setOpeningItemPublicId(item.publicId);
      try {
        const blob = await feature.getMaterial(coursePublicId, item.publicId);
        if (sequence !== openSequence.current) {
          return;
        }
        if (materialUrl.current) {
          URL.revokeObjectURL(materialUrl.current);
        }
        const url = URL.createObjectURL(blob);
        materialUrl.current = url;
        const source = course.raw.items.find(candidate => candidate.publicId === item.publicId);
        setMaterial({ scope: feature.scope, url, mimeType: blob.type, fileName: source?.file?.fileName ?? item.title });
      } catch {
        if (sequence === openSequence.current) {
          setOpenError('Не удалось открыть материал. Попробуйте ещё раз.');
        }
      } finally {
        if (sequence === openSequence.current) {
          setOpeningItemPublicId(null);
        }
      }
    }
  };
  const deleteCourse = async () => {
    setDeleteError(false);
    try {
      await feature.remove(coursePublicId);
      toast.success('Курс удалён');
      navigate(basePath);
    } catch {
      setDeleteError(true);
      toast.error('Не удалось удалить курс. Попробуйте ещё раз.');
    }
  };
  const markItem = async (item: CourseProgramItem) => {
    if (feature.state.operations[`progress:${coursePublicId}`] || !query.progressQuery.isSuccess || item.itemType === 3) {
      return;
    }
    setProgressError(false);
    try {
      await feature.mark(coursePublicId, item);
    } catch {
      setProgressError(true);
    }
  };
  return {
    query, course, focusItemPublicId: search.get('item') ?? undefined,
    audienceQuery: course?.canManage ? query.rosterQuery : query.progressQuery,
    tab: tab === 'students' && !course?.canManage ? 'lessons' as const : tab,
    setTab, dialog, setDialog,
    progress: { isError: progressError, isPending: feature.state.operations[`progress:${coursePublicId}`] ?? false },
    remove: { isError: deleteError, isPending: feature.state.operations[`delete:${coursePublicId}`] ?? false },
    deleteCourse: () => { void deleteCourse(); },
    goBack: () => navigate(basePath), openItem: (item: CourseProgramItem) => { void openItem(item); },
    closeDialog: () => setDialog(null), markItem: (item: CourseProgramItem) => { void markItem(item); },
    openError, openingItemPublicId, material: material?.scope === feature.scope ? material : null, closeMaterial,
  };
}
