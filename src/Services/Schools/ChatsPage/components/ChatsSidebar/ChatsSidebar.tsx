import { Alert, Avatar, Box, Button, List, ListItemAvatar, ListItemButton, ListItemText, Tab, Tabs, Typography } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import type { ChatsWorkspaceState } from '../../hooks/useChatsWorkspace';
import { styles as pageStyles } from '../../ChatsPage.styles';
import { CHAT_LIST_LOADER_SIZE } from './ChatsSidebar.const';
import { styles } from './ChatsSidebar.styles';

export default function ChatsSidebar({ view }: { view: ChatsWorkspaceState }) {
  return <>
    <Box sx={pageStyles.sidebarHeader}>
      <Typography variant="h5" sx={pageStyles.sidebarTitle}>Чаты</Typography>
      <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={view.openDialog}>{view.activeTab === 'branch' ? 'Создать' : 'Написать'}</Button>
    </Box>
    <Box sx={pageStyles.tabsContainer}>
      <Tabs value={view.activeTab} onChange={(_, value) => view.setActiveTab(value)} variant="fullWidth" aria-label="Тип чата">
        <Tab icon={<GroupIcon />} label="Группы" value="branch" /><Tab icon={<PersonIcon />} label="Личные" value="direct" />
      </Tabs>
    </Box>
    {view.isLoading && <Box sx={styles.loading}><ClipLoader size={CHAT_LIST_LOADER_SIZE} color="currentColor" /></Box>}
    {view.isError && <Box sx={styles.error}><Alert severity="error">Ошибка чатов</Alert></Box>}
    {!view.isLoading && !view.isError && view.currentThreads.length === 0 && <Box sx={styles.empty}><Typography color="text.secondary" variant="body2">{view.activeTab === 'branch' ? 'Групповых чатов пока нет' : 'Нет личных диалогов'}</Typography></Box>}
    <List sx={pageStyles.chatList}>
      {view.currentThreads.map(thread => {
        const selected = view.activeThread?.id === thread.id && view.activeThread?.type === thread.type;
        return <ListItemButton key={`${thread.type}-${thread.id}`} onClick={() => view.openThread(thread)} selected={selected} sx={pageStyles.chatItem}>
          <ListItemAvatar><Avatar sx={styles.avatar(selected)}>{thread.type === 'branch' ? <GroupIcon /> : <PersonIcon />}</Avatar></ListItemAvatar>
          <ListItemText primary={<Typography sx={styles.name(selected)} noWrap>{thread.name}</Typography>} secondary={thread.type === 'branch' ? 'Групповой чат' : 'Личная переписка'} />
        </ListItemButton>;
      })}
    </List>
  </>;
}
