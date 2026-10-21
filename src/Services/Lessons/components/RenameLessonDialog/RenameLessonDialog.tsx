import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import type { Lesson } from '../FileManager/FileManager.types';
import { useRenameLesson } from '../../hooks/useRenameLesson';
import { styles } from './RenameLessonDialog.styles';

interface RenameLessonDialogProps {
  schoolPublicId: string;
  lesson: Lesson;
  onClose: () => void;
}

export default function RenameLessonDialog({ schoolPublicId, lesson, onClose }: RenameLessonDialogProps) {
  const view = useRenameLesson(schoolPublicId, lesson, onClose);
  return <Dialog open onClose={view.close} fullWidth maxWidth="sm">
    <DialogTitle>Переименовать урок</DialogTitle>
    <form onSubmit={event => { event.preventDefault(); void view.submit(); }}>
      <DialogContent sx={styles.content}>
        <TextField label="Название урока" autoFocus fullWidth value={view.title} disabled={view.isSaving} onChange={event => view.changeTitle(event.target.value)} />
        {view.error && <Alert severity="error">{view.error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={view.close} disabled={view.isSaving}>Отмена</Button>
        <Button type="submit" variant="contained" disabled={view.isSaving} startIcon={view.isSaving ? <ClipLoader size={16} color="currentColor" /> : undefined}>Сохранить название</Button>
      </DialogActions>
    </form>
  </Dialog>;
}
