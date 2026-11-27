import { useState } from 'react';
import { Alert, Button, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material';
import type { StudentGroupsProps } from './StudentGroups.type';
import StudentGroupDialog from '../StudentGroupDialog/StudentGroupDialog';
import type { StudentGroupAction } from '../StudentGroupDialog/StudentGroupDialog.type';
import { sectionTitleSx } from '../../StudentsPage/StudentsPage.styles';

export default function StudentGroups({ directory }: StudentGroupsProps) {
  const [action, setAction] = useState<StudentGroupAction | null>(null);
  const groups = directory.data?.groups ?? [];
  const members = directory.data?.members ?? [];

  return (
    <Paper component="section" aria-labelledby="student-groups-title" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography component="h2" id="student-groups-title" sx={sectionTitleSx}>Группы</Typography>
        <Button
          variant="outlined"
          disabled={!directory.data || !!action}
          onClick={() => setAction({ kind: 'create', group: { publicId: crypto.randomUUID(), name: '', memberPublicIds: [] } })}
        >Создать группу</Button>
      </Stack>
      {directory.isPending && <Typography role="status">Загружаем группы…</Typography>}
      {directory.isError && (
        <Alert severity="error" action={<Button color="inherit" onClick={() => void directory.refetch()}>Повторить</Button>}>
          Не удалось загрузить группы.
        </Alert>
      )}
      {directory.isSuccess && groups.length === 0 && <Typography color="text.secondary">В школе пока нет групп.</Typography>}
      <List disablePadding>
        {groups.map(group => (
          <ListItem key={group.publicId} divider sx={{ px: 0, flexWrap: 'wrap', gap: 1 }}>
            <ListItemText primary={group.name} secondary={`Участников: ${group.memberPublicIds.length}`} sx={{ overflowWrap: 'anywhere' }} />
            <Button aria-label={`Изменить группу ${group.name}`} onClick={() => setAction({ kind: 'edit', group })}>Изменить</Button>
            <Button aria-label={`Удалить группу ${group.name}`} color="error" onClick={() => setAction({ kind: 'delete', group })}>Удалить</Button>
          </ListItem>
        ))}
      </List>
      {action && (
        <StudentGroupDialog
          key={action.group.publicId}
          action={action}
          members={members}
          isWriting={directory.isWriting}
          onSave={directory.save}
          onDelete={directory.remove}
          onClose={() => setAction(null)}
        />
      )}
    </Paper>
  );
}
