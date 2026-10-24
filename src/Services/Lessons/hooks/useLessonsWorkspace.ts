import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLessons } from './useLessons/useLessons';
import { useLessonMutations } from './useLessonMutations/useLessonMutations';
import { useCreateLessonFlow } from './useCreateLessonFlow/useCreateLessonFlow';
import type { LessonsMainPageProps } from '../LessonsMainPage.types';

export function useLessonsWorkspace({ onOpenLesson }: LessonsMainPageProps) {
  const { schoolPublicId = '' } = useParams();
  const navigate = useNavigate();
  const query = useLessons();
  const mutations = useLessonMutations();
  const [renameId, setRenameId] = useState<string | null>(null);
  const openLesson = (id: string, title: string) => {
    if (onOpenLesson) onOpenLesson(id, title);
    else navigate(`/app/schools/${schoolPublicId}/lessons/${id}?edit=true`);
  };
  const create = useCreateLessonFlow({ onSuccess: openLesson });
  return {
    ...query,
    schoolPublicId, openLesson,
    createLesson: () => create.handleCreateLesson(),
    isCreating: create.isCreating,
    renameLesson: query.lessons?.find(lesson => String(lesson.id) === renameId),
    openRename: (id: string) => setRenameId(String(id)),
    closeRename: () => setRenameId(null),
    deleteLesson: (id: string) => mutations.deleteLesson.mutate({ id }),
  };
}
