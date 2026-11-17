import type { LessonWorkspaceProps } from './LessonWorkspace.type';
import { useState } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate } from 'react-router-dom';
import { useCurrentSchool } from '@/Services/AppShell/hooks/useCurrentSchool';
import { getIsMobileDevice } from '@/Assets/device.utils';
import { useLessonEditor } from '../../hooks/useLessonEditor/useLessonEditor';
import { useSaveLesson } from '../../hooks/useSaveLesson';
import LessonEditorContainer from '../LessonEditorContainer/LessonEditorContainer';
import LessonEditorStatus from '../LessonEditorStatus/LessonEditorStatus';
import RenameLessonDialog from '../RenameLessonDialog/RenameLessonDialog';

export default function LessonWorkspace({ lessonId, requestedEditMode }: LessonWorkspaceProps) {
  const view = useLessonEditor({ lessonId });
  const { capabilities } = useCurrentSchool();
  const navigate = useNavigate();
  const [isRenaming, setIsRenaming] = useState(false);
  const save = useSaveLesson(view.schoolPublicId, lessonId);
  const isEditMode = requestedEditMode && capabilities.canTeach && !getIsMobileDevice();

  return <Box className="lesson-id-page">
    <Box component="header" sx={{ display: 'grid', gridTemplateColumns: { xs: 'auto minmax(0, 1fr)', sm: 'auto minmax(0, 1fr) auto' }, alignItems: 'start', gap: 1.5 }}>
      <IconButton data-testid="lesson-back" aria-label="К статьям" title="К статьям" sx={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid', borderColor: 'divider', flexShrink: 0 }} onClick={() => navigate('../', { relative: 'path' })}><ArrowBackRoundedIcon /></IconButton>
      <Typography component="h1" sx={{ minWidth: 0, fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 800, overflowWrap: 'anywhere' }}>{view.lesson?.title ?? 'Статья'}</Typography>
      {capabilities.canTeach && view.lesson && <Button data-testid="lesson-rename" sx={{ gridColumn: { xs: '2 / -1', sm: 'auto' }, justifySelf: 'start' }} onClick={() => setIsRenaming(true)} disabled={save.isSaving}>Переименовать</Button>}
    </Box>
    {view.isLoading || view.isError || view.isUnavailable ? <LessonEditorStatus {...view} /> : view.lesson && view.editorState ? (
      <LessonEditorContainer key={`${view.schoolPublicId}:${lessonId}:${isEditMode}`} schoolPublicId={view.schoolPublicId} lesson={view.lesson} document={view.editorState} isEditMode={isEditMode} />
    ) : null}
    {isRenaming && view.lesson && <RenameLessonDialog schoolPublicId={view.schoolPublicId} lesson={view.lesson} onClose={() => setIsRenaming(false)} />}
  </Box>;
}
