import { useState } from 'react';
import { 
  Box, Typography, Tabs, Tab, List, ListItemButton, 
  ListItemAvatar, Avatar, ListItemText, CircularProgress, Alert
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { useChatList } from '@/Services/Chat/hooks/useChatList/useChatList';
import { useChatContext } from '@/Storage/useChatContext/useChatContext.tsx';
import { widgetStyles } from '../ChatWidget/ChatWidget.styles';

export default function ChatList({ schoolId, schoolPublicId }: { schoolId: number; schoolPublicId: string }) {
  const [tab, setTab] = useState<'branch' | 'direct'>('branch');
  const { threads, isLoading, isError } = useChatList(schoolId, schoolPublicId);
  const { setActiveThread } = useChatContext();

  const filteredThreads = threads.filter(t => t.type === tab);

  return (
    <>
      <Box sx={{ ...widgetStyles.header, bgcolor: 'background.paper', color: 'text.primary' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, pl: 1 }}>
          Чаты
        </Typography>
      </Box>
      
      <Tabs 
        value={tab} 
        onChange={(_, v) => setTab(v)} 
        variant="fullWidth" 
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Ветки" value="branch" />
        <Tab label="Личные" value="direct" />
      </Tabs>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}
        
        {isError && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">Ошибка загрузки чатов</Alert>
          </Box>
        )}

        {!isLoading && !isError && filteredThreads.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              {tab === 'branch' ? 'Ветки не найдены' : 'Нет доступных контактов'}
            </Typography>
          </Box>
        )}

        <List disablePadding>
          {filteredThreads.map(thread => (
            <ListItemButton key={thread.id} onClick={() => setActiveThread(thread)}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  {thread.type === 'branch' ? <GroupIcon /> : <PersonIcon />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={<Typography sx={{ fontWeight: 500 }}>{thread.name}</Typography>} 
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </>
  );
}
