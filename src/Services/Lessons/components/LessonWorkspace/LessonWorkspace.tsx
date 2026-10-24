import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate } from 'react-router-dom';
import { useCurrentSchool } from '@/Services/AppShell/hooks/useCurrentSchool';
import { getIsMobileDevice } from '@/Assets/device.utils';
import { useLessonEditor } from '../../hooks/useLessonEditor/useLessonEditor';
import { useSaveLesson } from '../../hooks/useSaveLesson';
import LessonEditorContainer from '../LessonEditorContainer/LessonEditorContainer';
import LessonEditorStatus from '../LessonEditorStatus/LessonEditorStatus';
import RenameLessonDialog from '../RenameLessonDialog/RenameLessonDialog';
import '../../LessonIdPage.css';

interface LessonWorkspaceProps {
  lessonId: string;
  requestedEditMode: boolean;
}

export default function LessonWorkspace({ lessonId, requestedEditMode }: LessonWorkspaceProps) {
  const view = useLessonEditor({ lessonId });
  const { capabilities } = useCurrentSchool();
  const navigate = useNavigate();
  const [isRenaming, setIsRenaming] = useState(false);
  const save = useSaveLesson(view.schoolPublicId, lessonId);
  const isEditMode = requestedEditMode && capabilities.canTeach && !getIsMobileDevice();

  return <Box className="lesson-id-page">
    <Box className="lesson-page-actions">
      <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('../', { relative: 'path' })}>К урокам</Button>
      {capabilities.canTeach && view.lesson && <Button onClick={() => setIsRenaming(true)} disabled={save.isSaving}>Переименовать</Button>}
    </Box>
    <Typography variant="h1" className="lesson-name">{view.lesson?.title ?? 'Урок'}</Typography>
    {view.isLoading || view.isError || view.isUnavailable ? <LessonEditorStatus {...view} /> : view.lesson && view.editorState ? (
      <LessonEditorContainer key={`${view.schoolPublicId}:${lessonId}:${isEditMode}`} schoolPublicId={view.schoolPublicId} lesson={view.lesson} document={view.editorState} isEditMode={isEditMode} />
    ) : null}
    {isRenaming && view.lesson && <RenameLessonDialog schoolPublicId={view.schoolPublicId} lesson={view.lesson} onClose={() => setIsRenaming(false)} />}
  </Box>;
}
