import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { viewLessonProps } from '@/Services/Lessons/lessonTypes';
import { useCurrentSchool } from '@/Services/AppShell/hooks/useCurrentSchool';
import LessonEditorContainer from './components/LessonEditorContainer/LessonEditorContainer';
import './LessonIdPage.css';
import { getIsMobileDevice } from '@/Assets/device.utils';

export default function LessonIdPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const locationState = useLocation().state as viewLessonProps | null;
  const [searchParams] = useSearchParams();
  const { capabilities } = useCurrentSchool();
  const isMobile = getIsMobileDevice();
  const [isMobileEditNoticeOpen, setIsMobileEditNoticeOpen] = useState(false);
  const requestedEditMode = searchParams.get('edit') === 'true';
  const isEditMode = requestedEditMode && capabilities.canTeach && !isMobile;
  const id = locationState?.id ?? lessonId;
  const title = locationState?.title ?? 'Урок';

  return (
    <Box className="lesson-id-page">
      <Box className="lesson-page-actions">
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('../', { relative: 'path' })}>
          К урокам
        </Button>
        {capabilities.canTeach && isMobile && (
          <IconButton
            aria-label="Редактировать урок"
            onClick={() => setIsMobileEditNoticeOpen(true)}
          >
            <EditRoundedIcon />
          </IconButton>
        )}
      </Box>

      <Typography
        variant="h1"
        className={`lesson-name ${isEditMode ? 'editable' : ''}`}
        contentEditable={isEditMode}
        suppressContentEditableWarning
      >
        {title}
      </Typography>

      {id && <LessonEditorContainer isEditMode={isEditMode} id={id} />}

      <Dialog open={isMobileEditNoticeOpen} onClose={() => setIsMobileEditNoticeOpen(false)}>
        <DialogTitle>Редактирование урока</DialogTitle>
        <DialogContent>
          <Typography>
            Редактирование доступно только в полной версии сайта. На телефоне урок можно просматривать.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setIsMobileEditNoticeOpen(false)}>Понятно</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
