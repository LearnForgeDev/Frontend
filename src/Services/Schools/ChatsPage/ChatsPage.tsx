import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';

// Icons
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ForumIcon from '@mui/icons-material/Forum';
import TagIcon from '@mui/icons-material/Tag';

import { useChats } from './hooks/useChats';
import { useChatMessages } from '@/Services/Chat/hooks/useChatMessages/useChatMessages';
import type { ChatThread } from '@/Services/Chat/Chat.types';
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';
import { styles } from './ChatsPage.styles';

export default function ChatsPage() {
  const { schoolPublicId = '' } = useParams<{ schoolPublicId: string }>();
  const showNotification = useGlobalNotificationStore((s) => s.pushNotification);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get active school ID from context
  const schoolId = 1; // Default or fallback, but let's obtain from localStorage/context if available

  // Load chats data and methods
  const {
    branchThreads,
    directThreads,
    isLoading,
    isError,
    createBranch,
    addDirectChat,
  } = useChats(schoolId, schoolPublicId);

  // States
  const [activeTab, setActiveTab] = useState<'branch' | 'direct'>('branch');
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  
  // Create dialog states
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  
  const [isDirectDialogOpen, setIsDirectDialogOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactId, setContactId] = useState('');

  // Switch tabs
  const handleTabChange = (_: React.SyntheticEvent, newValue: 'branch' | 'direct') => {
    setActiveTab(newValue);
  };

  // Compile list of threads
  const currentThreads = activeTab === 'branch' ? branchThreads : directThreads;

  // Group chat creation submit
  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      const newBranch = await createBranch({
        name: groupName.trim(),
        description: groupDesc.trim(),
      });
      
      showNotification({
        id: `branch-created-${Date.now()}`,
        title: 'Ветка создана',
        subtitle: `Ветка "${newBranch.name}" успешно создана в школе.`,
        priority: 'low',
        time: 3000,
      });

      // Clear & Close
      setGroupName('');
      setGroupDesc('');
      setIsGroupDialogOpen(false);

      // Select newly created chat
      setActiveThread({
        id: newBranch.id.toString(),
        type: 'branch',
        name: newBranch.name,
        schoolPublicId,
      });
    } catch (err) {
      console.error('Create branch error:', err);
      showNotification({
        id: `branch-create-failed-${Date.now()}`,
        title: 'Ошибка создания ветки',
        subtitle: 'Не удалось создать групповой чат на сервере.',
        priority: 'high',
        time: 4000,
      });
    }
  };

  // Direct chat creation submit
  const handleCreateDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactId.trim()) return;

    // Validate if it is a GUID
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(contactId.trim())) {
      showNotification({
        id: `invalid-guid-${Date.now()}`,
        title: 'Некорректный ID',
        subtitle: 'Пожалуйста, введите корректный Public ID пользователя (GUID).',
        priority: 'medium',
        time: 3000,
      });
      return;
    }

    const newThread = addDirectChat(contactName.trim(), contactId.trim());

    showNotification({
      id: `direct-created-${Date.now()}`,
      title: 'Контакт добавлен',
      subtitle: `Чат с пользователем "${contactName}" инициализирован.`,
      priority: 'low',
      time: 3000,
    });

    setContactName('');
    setContactId('');
    setIsDirectDialogOpen(false);
    setActiveThread(newThread);
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.chatLayout}>
        {/* Left Side: Sidebar */}
        <Box
          sx={{
            ...styles.sidebar,
            width: isMobile ? '100%' : '320px',
            display: isMobile && activeThread ? 'none' : 'flex',
          }}
        >
          <Box sx={styles.sidebarHeader}>
            <Typography variant="h5" sx={styles.sidebarTitle}>
              Чаты
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                if (activeTab === 'branch') {
                  setIsGroupDialogOpen(true);
                } else {
                  setIsDirectDialogOpen(true);
                }
              }}
            >
              Создать
            </Button>
          </Box>

          <Box sx={styles.tabsContainer}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="Тип чата"
            >
              <Tab icon={<GroupIcon />} label="Группы" value="branch" />
              <Tab icon={<PersonIcon />} label="Личные" value="direct" />
            </Tabs>
          </Box>

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={30} />
            </Box>
          )}

          {isError && (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">Ошибка чатов</Alert>
            </Box>
          )}

          {!isLoading && !isError && currentThreads.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="body2">
                {activeTab === 'branch' ? 'Ветки отсутствуют' : 'Нет личных контактов'}
              </Typography>
            </Box>
          )}

          <List sx={styles.chatList}>
            {currentThreads.map((thread) => {
              const isSelected = activeThread?.id === thread.id && activeThread?.type === thread.type;
              return (
                <ListItemButton
                  key={`${thread.type}-${thread.id}`}
                  onClick={() => setActiveThread(thread)}
                  selected={isSelected}
                  sx={styles.chatItem}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: isSelected ? 'primary.main' : 'primary.light' }}>
                      {thread.type === 'branch' ? <GroupIcon /> : <PersonIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: isSelected ? 600 : 500 }} noWrap>
                        {thread.name}
                      </Typography>
                    }
                    secondary={
                      thread.type === 'branch' ? 'Групповая ветка' : 'Личная переписка'
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {/* Right Side: Chat Window */}
        <Box
          sx={{
            ...styles.chatArea,
            flex: 1,
            display: isMobile && !activeThread ? 'none' : 'flex',
          }}
        >
          {activeThread ? (
            <ActiveChatView
              activeThread={activeThread}
              isMobile={isMobile}
              onBack={() => setActiveThread(null)}
            />
          ) : (
            <Box sx={styles.placeholderArea}>
              <ForumIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary">
                Выберите диалог из списка
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Или создайте новую группу/прямой контакт с помощью кнопки «Создать»
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Create Group Chat Dialog */}
      <Dialog
        open={isGroupDialogOpen}
        onClose={() => setIsGroupDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Новый групповой чат (Ветка)</DialogTitle>
        <Box component="form" onSubmit={handleCreateGroupSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Название чата"
              fullWidth
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Например: Обсуждение ДЗ"
            />
            <TextField
              label="Описание ветки"
              fullWidth
              multiline
              rows={2}
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
              placeholder="Краткое описание темы общения"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsGroupDialogOpen(false)}>Отмена</Button>
            <Button type="submit" variant="contained" disabled={!groupName.trim()}>
              Создать
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Create Direct Chat Dialog */}
      <Dialog
        open={isDirectDialogOpen}
        onClose={() => setIsDirectDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Новая личная беседа</DialogTitle>
        <Box component="form" onSubmit={handleCreateDirectSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Отображаемое имя собеседника"
              fullWidth
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Например: Иван Иванов"
            />
            <TextField
              label="Public ID собеседника (GUID)"
              fullWidth
              required
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              placeholder="b2c0f203-b092-4d29-a1fc..."
              helperText="GUID идентификатор пользователя для SignalR связи"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDirectDialogOpen(false)}>Отмена</Button>
            <Button type="submit" variant="contained" disabled={!contactName.trim() || !contactId.trim()}>
              Добавить
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

// Inner helper component for handling active SignalR connection and rendering messages
interface ActiveChatViewProps {
  activeThread: ChatThread;
  isMobile: boolean;
  onBack: () => void;
}

function ActiveChatView({ activeThread, isMobile, onBack }: ActiveChatViewProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connection parameters
  const { messages, sendMessage, status } = useChatMessages({
    type: activeThread.type,
    threadId: activeThread.id,
    schoolPublicId: activeThread.schoolPublicId,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'connected': return 'Подключено';
      case 'connecting': return 'Подключение...';
      case 'reconnecting': return 'Переподключение...';
      case 'disconnected': return 'Отключено';
      default: return status;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'success';
      case 'connecting':
      case 'reconnecting': return 'warning';
      case 'disconnected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat header */}
      <Box sx={styles.chatHeader}>
        {isMobile && (
          <IconButton onClick={onBack} size="small" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Avatar sx={{ bgcolor: 'primary.dark' }}>
          {activeThread.type === 'branch' ? <GroupIcon /> : <PersonIcon />}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={styles.chatHeaderTitle} noWrap>
            {activeThread.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {activeThread.type === 'branch' ? 'Групповая ветка' : 'Личный чат'}
          </Typography>
        </Box>
        <Chip
          label={getStatusLabel()}
          color={getStatusColor()}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      </Box>

      {/* Messages area */}
      <Box sx={styles.messagesArea}>
        {messages.length === 0 && (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">Сообщений пока нет. Начните диалог первым!</Typography>
          </Box>
        )}
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={styles.messageBubbleContainer(msg.isOwn)}
          >
            <Box sx={styles.messageBubble(msg.isOwn)}>
              {!msg.isOwn && (
                <Typography variant="caption" sx={styles.messageSender}>
                  {msg.senderName}
                </Typography>
              )}
              <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </Typography>
              <Typography variant="caption" sx={styles.messageTime}>
                {new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input area */}
      <Box sx={styles.inputArea}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Напишите сообщение..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={status !== 'connected'}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!inputText.trim() || status !== 'connected'}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
