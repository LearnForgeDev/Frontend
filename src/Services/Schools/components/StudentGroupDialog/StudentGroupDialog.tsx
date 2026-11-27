import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { isAxiosError } from 'axios';
import type { StudentGroupDialogProps } from './StudentGroupDialog.type';

export default function StudentGroupDialog({ action, members, isWriting, onSave, onDelete, onClose }: StudentGroupDialogProps) {
  const [name, setName] = useState(action.group.name);
  const [memberIds, setMemberIds] = useState(action.group.memberPublicIds);
  const [error, setError] = useState('');
  const deleting = action.kind === 'delete';
  const nameIsValid = name.trim().length > 0 && name.trim().length <= 100;
  const title = deleting ? 'Удалить группу' : action.kind === 'create' ? 'Новая группа' : 'Изменить группу';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isWriting || (!deleting && !nameIsValid)) {
      return;
    }
    setError('');
    try {
      if (action.kind === 'delete') {
        await onDelete(action.group.publicId);
      } else {
        await onSave({ kind: action.kind, group: { ...action.group, name: name.trim(), memberPublicIds: memberIds } });
      }
      onClose();
    } catch (failure) {
      const inUse = deleting && isAxiosError(failure) && failure.response?.status === 409;
      setError(inUse ? 'Удалить можно только пустую группу, которая не используется в школе.'
        : deleting ? 'Не удалось удалить группу. Попробуйте ещё раз.' : 'Не удалось сохранить группу. Попробуйте ещё раз.');
    }
  };

  return (
    <Dialog open onClose={isWriting ? undefined : onClose} fullWidth maxWidth="sm" aria-labelledby="student-group-dialog-title">
      <form onSubmit={event => void submit(event)}>
        <DialogTitle id="student-group-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {deleting ? (
              <Typography>Удалить группу «{action.group.name}»?</Typography>
            ) : (
              <>
                <TextField
                  autoFocus
                  label="Название группы"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  disabled={isWriting}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
                <Autocomplete
                  multiple
                  options={members}
                  value={members.filter(member => memberIds.includes(member.userPublicId))}
                  getOptionLabel={member => member.displayName}
                  getOptionKey={member => member.userPublicId}
                  isOptionEqualToValue={(option, selected) => option.userPublicId === selected.userPublicId}
                  onChange={(_, selected) => setMemberIds(selected.map(member => member.userPublicId))}
                  disabled={isWriting}
                  noOptionsText="Участники не найдены"
                  clearText="Очистить"
                  openText="Показать участников"
                  closeText="Скрыть список участников"
                  renderInput={params => <TextField {...params} label="Участники" />}
                />
              </>
            )}
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isWriting}>Отмена</Button>
          <Button type="submit" variant="contained" color={deleting ? 'error' : 'primary'} disabled={isWriting || (!deleting && !nameIsValid)}>
            {deleting ? 'Удалить' : 'Сохранить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
