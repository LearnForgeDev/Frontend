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
  Autocomplete,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ForumIcon from '@mui/icons-material/Forum';
import AttachFileIcon from '@mui/icons-material/AttachFile';

import { useChats } from './hooks/useChats';
import { useChatMessages } from '@/Services/Chat/hooks/useChatMessages/useChatMessages';
import type { ChatThread } from '@/Services/Chat/Chat.types';
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';
import FileSelectorModal from '@/Services/Chat/components/FileSelectorModal/FileSelectorModal';
import { filesEndpoints } from '@/Endpoints';
import AuthenticatedImage from '@/Assets/Components/AuthenticatedImage';
import { styles } from './ChatsPage.styles';

export default function ChatsPage() {
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();
  if (!schoolPublicId) {
    throw new Error('schoolPublicId is missing in URL');
  }

  const showNotification = useGlobalNotificationStore((s) => s.pushNotification);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentUserPublicId = useGlobalContext((s) => s.auth.user?.userPublicId);

  const {
    branchThreads,
    directThreads,
    members,
    isMembersLoading,
    isLoading,
    isError,
    refetch,
    createBranch,
    addDirectChat,
  } = useChats(schoolPublicId);

  const [activeTab, setActiveTab] = useState<'branch' | 'direct'>('branch');
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  
  const [isDirectDialogOpen, setIsDirectDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ displayName: string; userPublicId: string } | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: 'branch' | 'direct') => {
    setActiveTab(newValue);
  };

  const currentThreads = activeTab === 'branch' ? branchThreads : directThreads;

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
        subtitle: `Ветка "${groupName.trim()}" успешно создана в школе.`,
        priority: 'low',
        time: 3000,
      });

      await refetch();

      setActiveThread({
        id: newBranch.publicId,
        type: 'branch',
        name: groupName.trim(),
        schoolPublicId,
      });

      setGroupName('');
      setGroupDesc('');
      setIsGroupDialogOpen(false);
    } catch (err) {
      console.error(err);
      showNotification({
        id: `branch-create-failed-${Date.now()}`,
        title: 'Ошибка создания ветки',
        subtitle: 'Не удалось создать групповой чат на сервере.',
        priority: 'high',
        time: 4000,
      });
    }
  };

  const handleCreateDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const newThread = addDirectChat(selectedMember.displayName, selectedMember.userPublicId);

    showNotification({
      id: `direct-created-${Date.now()}`,
      title: 'Контакт добавлен',
      subtitle: `Чат с пользователем "${selectedMember.displayName}" инициализирован.`,
      priority: 'low',
      time: 3000,
    });

    setSelectedMember(null);
    setIsDirectDialogOpen(false);
    setActiveThread(newThread);
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.chatLayout}>
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
              {activeTab === 'branch' ? 'Создать' : 'Написать'}
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
                {activeTab === 'branch'
                  ? 'Или создайте новую группу с помощью кнопки «Создать»'
                  : 'Или выберите собеседника с помощью кнопки «Написать»'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

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

      <Dialog
        open={isDirectDialogOpen}
        onClose={() => setIsDirectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Написать сообщение</DialogTitle>
        <Box component="form" onSubmit={handleCreateDirectSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Выберите собеседника для начала диалога:
            </Typography>

            <Autocomplete
              options={members.filter((m) => m.userPublicId !== currentUserPublicId)}
              getOptionLabel={(option) => option.displayName}
              loading={isMembersLoading}
              value={selectedMember}
              onChange={(_, selected) => setSelectedMember(selected)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Собеседник"
                  placeholder="Поиск по имени участника..."
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDirectDialogOpen(false)}>Отмена</Button>
            <Button type="submit" variant="contained" disabled={!selectedMember}>
              Написать
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

interface ActiveChatViewProps {
  activeThread: ChatThread;
  isMobile: boolean;
  onBack: () => void;
}
function formatMessageTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return `${d.toLocaleDateString([], { day: '2-digit', month: '2-digit' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function ActiveChatView({ activeThread, isMobile, onBack }: ActiveChatViewProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ publicId: string; fileName: string }>>([]);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [previewImageFileId, setPreviewImageFileId] = useState<string | null>(null);

  const { messages, sendMessage, status } = useChatMessages({
    type: activeThread.type,
    threadId: activeThread.id,
    schoolPublicId: activeThread.schoolPublicId,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isImageFile = (fileName?: string): boolean => {
    if (!fileName) return false;
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
  };

  const handleSelectFiles = (selected: Array<{ publicId: string; fileName: string }>) => {
    setAttachedFiles(prev => {
      const prevIds = prev.map(f => f.publicId);
      const filtered = selected.filter(f => !prevIds.includes(f.publicId));
      return [...prev, ...filtered];
    });
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed && attachedFiles.length === 0) return;
    sendMessage(trimmed, attachedFiles.map(f => f.publicId));
    setInputText('');
    setAttachedFiles([]);
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
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
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
              {msg.files && msg.files.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5, opacity: 0.9 }}>
                  {msg.files.map((file) => (
                    <Box key={file.publicId} sx={{ display: 'flex', alignItems: 'flex-start', mt: 0.5 }}>
                      {isImageFile(file.fileName) ? (
                        <AuthenticatedImage
                          schoolPublicId={activeThread.schoolPublicId}
                          filePublicId={file.publicId || ''}
                          alt={file.fileName}
                          onClick={() => file.publicId && setPreviewImageFileId(file.publicId)}
                          sx={{
                            width: '100%',
                            maxWidth: '240px',
                            maxHeight: '180px',
                            borderRadius: 0,
                            objectFit: 'cover',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                            '&:hover': {
                              opacity: 0.9,
                            },
                          }}
                        />
                      ) : (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
                          onClick={() => file.publicId && filesEndpoints.downloadFile(activeThread.schoolPublicId, file.publicId, file.fileName)}
                        >
                          <AttachFileIcon sx={{ fontSize: '0.9rem', transform: 'rotate(45deg)' }} />
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'inherit',
                              fontSize: '0.75rem',
                              textDecoration: 'underline',
                              wordBreak: 'break-all',
                            }}
                          >
                            {file.fileName || 'Вложенный файл'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
              <Typography variant="caption" sx={styles.messageTime}>
                {formatMessageTime(msg.receivedAt)}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      {/* Attached files preview */}
      {attachedFiles.length > 0 && (
        <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 1, borderTop: (theme) => `1px solid ${theme.palette.divider}`, bgcolor: 'background.default' }}>
          {attachedFiles.map((file) => (
            <Chip
              key={file.publicId}
              label={file.fileName}
              onDelete={() => setAttachedFiles(prev => prev.filter(f => f.publicId !== file.publicId))}
              size="small"
              sx={{ maxWidth: 200 }}
            />
          ))}
        </Box>
      )}

      {/* Input area */}
      <Box sx={styles.inputArea}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <IconButton
            color="primary"
            onClick={() => setIsFileModalOpen(true)}
            disabled={status !== 'connected'}
            aria-label="Прикрепить файл"
          >
            <AttachFileIcon sx={{ transform: 'rotate(45deg)' }} />
          </IconButton>
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
            disabled={(!inputText.trim() && attachedFiles.length === 0) || status !== 'connected'}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>

      <FileSelectorModal
        open={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        schoolPublicId={activeThread.schoolPublicId}
        onSelectFiles={handleSelectFiles}
      />

      <Dialog
        open={Boolean(previewImageFileId)}
        onClose={() => setPreviewImageFileId(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: {
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)' }
          },
          paper: {
            sx: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }
          }
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: '100%', maxHeight: '90vh' }}>
          {previewImageFileId && (
            <AuthenticatedImage
              schoolPublicId={activeThread.schoolPublicId}
              filePublicId={previewImageFileId}
              alt="Preview"
              sx={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: 0,
                cursor: 'pointer',
              }}
              onClick={() => setPreviewImageFileId(null)}
            />
          )}
        </Box>
      </Dialog>
    </Box>
  );
}
