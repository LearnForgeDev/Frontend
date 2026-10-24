import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import type { ChatsWorkspaceState } from '../../hooks/useChatsWorkspace';
import { DESCRIPTION_ROWS } from './ChatCreationDialogs.const';
import { styles } from './ChatCreationDialogs.styles';

export default function ChatCreationDialogs({ view }: { view: ChatsWorkspaceState }) {
  return <>
    <Dialog open={view.dialog === 'branch'} onClose={view.isCreatingBranch ? undefined : view.closeDialog} maxWidth="xs" fullWidth>
      <DialogTitle>Новый групповой чат</DialogTitle>
      <Box component="form" onSubmit={event => { event.preventDefault(); void view.createGroup(); }}>
        <DialogContent sx={styles.content}>
          <TextField label="Название чата" fullWidth required value={view.groupName} onChange={event => view.setGroupName(event.target.value)} placeholder="Например: Обсуждение ДЗ" disabled={view.isCreatingBranch} />
          <TextField label="Описание чата" fullWidth multiline rows={DESCRIPTION_ROWS} value={view.groupDesc} onChange={event => view.setGroupDesc(event.target.value)} placeholder="Краткое описание темы общения" disabled={view.isCreatingBranch} />
        </DialogContent>
        <DialogActions><Button onClick={view.closeDialog} data-testid="chat-group-cancel" disabled={view.isCreatingBranch}>Отмена</Button><Button data-testid="chat-group-submit" type="submit" variant="contained" disabled={!view.canCreateGroup}>Создать</Button></DialogActions>
      </Box>
    </Dialog>
    <Dialog open={view.dialog === 'direct'} onClose={view.closeDialog} maxWidth="sm" fullWidth>
      <DialogTitle>Написать сообщение</DialogTitle>
      <Box component="form" onSubmit={event => { event.preventDefault(); view.createDirect(); }}>
        <DialogContent sx={styles.content}>
          <Typography variant="body2" color="text.secondary">Выберите собеседника для начала диалога:</Typography>
          <Autocomplete options={view.members} getOptionLabel={option => option.displayName} isOptionEqualToValue={(first, second) => first.userPublicId === second.userPublicId}
            loading={view.isMembersLoading} value={view.selectedMember} onChange={(_, selected) => view.setSelectedMember(selected)}
            renderInput={params => <TextField {...params} label="Собеседник" placeholder="Поиск по имени участника..." />} />
        </DialogContent>
        <DialogActions><Button data-testid="chat-direct-cancel" onClick={view.closeDialog}>Отмена</Button><Button data-testid="chat-direct-submit" type="submit" variant="contained" disabled={!view.selectedMember}>Написать</Button></DialogActions>
      </Box>
    </Dialog>
  </>;
}
