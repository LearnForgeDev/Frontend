import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';
import type { useFilesPage } from '../hooks/useFilesPage';

type Props = Pick<ReturnType<typeof useFilesPage>, 'deleteConfirmFile' | 'setDeleteConfirmFile' | 'handleDeleteConfirm'>;

export default function FileDeleteDialog({ deleteConfirmFile, setDeleteConfirmFile, handleDeleteConfirm }: Props) {
  return (
      <Dialog
        open={!!deleteConfirmFile}
        onClose={() => setDeleteConfirmFile(null)}
      >
        <DialogTitle>Удаление файла</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить файл <strong>{deleteConfirmFile?.fileName || ''}</strong>?
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button data-testid="file-delete-cancel" onClick={() => setDeleteConfirmFile(null)}>Отмена</Button>
          <Button data-testid="file-delete-confirm" onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

  );
}
