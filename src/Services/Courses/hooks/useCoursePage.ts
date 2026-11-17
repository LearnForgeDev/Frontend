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
    if (item.block.kind !== 'supported' || !course || !course.canManage && (!item.isUnlocked || !isCourseItemAvailable(item))) {
      return;
    }
    setOpenError(null);
    const reference = item.block.input;
    const sequence = ++openSequence.current;
    setOpeningItemPublicId(item.publicId);
    try {
      if (!course.canManage && reference.itemType !== 0) {
        await feature.activity(coursePublicId, item.publicId, { kind: 0, sessionId: crypto.randomUUID(), elapsedSeconds: 0 });
        if (sequence !== openSequence.current) {
          return;
        }
      }
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
      }
    } catch {
      if (sequence === openSequence.current) {
        setOpenError('Не удалось открыть блок. Обновите курс и попробуйте ещё раз.');
        void feature.read({ kind: 'progress', coursePublicId, refresh: true });
      }
    } finally {
      if (sequence === openSequence.current) {
        setOpeningItemPublicId(null);
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
  const approveItem = async (studentPublicId: string, item: CourseProgramItem, status: 0 | 2) => {
    setProgressError(false);
    try {
      await feature.approve(coursePublicId, studentPublicId, item, status);
    } catch {
      setProgressError(true);
    }
  };
  return {
    query, course, focusItemPublicId: search.get('item') ?? undefined,
    audienceQuery: course?.canManage ? query.rosterQuery : query.progressQuery,
    tab: tab === 'students' && !course?.canManage ? 'lessons' as const : tab,
    setTab, dialog, setDialog,
    progress: { isError: progressError },
    remove: { isError: deleteError, isPending: feature.state.operations[`delete:${coursePublicId}`] ?? false },
    deleteCourse: () => { void deleteCourse(); },
    goBack: () => navigate(basePath), openItem: (item: CourseProgramItem) => { void openItem(item); },
    closeDialog: () => setDialog(null),
    approveItem: (studentPublicId: string, item: CourseProgramItem, status: 0 | 2) => { void approveItem(studentPublicId, item, status); },
    isApproving: feature.state.operations[`approve:${coursePublicId}`] ?? false,
    openError, openingItemPublicId, material: material?.scope === feature.scope ? material : null, closeMaterial,
  };
}
