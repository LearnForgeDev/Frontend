import { useEffect, useRef, useState } from 'react';
import { Box, Typography, IconButton, Avatar, Chip, Dialog } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useChatContext } from '@/Storage/useChatContext/useChatContext.tsx';
import { useChatMessages } from '@/Services/Chat/hooks/useChatMessages/useChatMessages';
import { filesEndpoints } from '@/Endpoints';
import AuthenticatedImage from '@/Assets/Components/AuthenticatedImage/AuthenticatedImage';
import ChatInput from './ChatInput';
import { widgetStyles } from '../ChatWidget/ChatWidget.styles';

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

export default function ChatThreadView() {
  const { activeThread, setActiveThread } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChatMessages({
    type: activeThread?.type || 'branch',
    threadId: activeThread?.id || '',
    schoolPublicId: activeThread?.schoolPublicId || '',
  });

  const [previewImageFileId, setPreviewImageFileId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isImageFile = (fileName?: string): boolean => {
    if (!fileName) return false;
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
  };

  if (!activeThread) return null;

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
    <>
      <Box sx={widgetStyles.header}>
        <IconButton color="inherit" onClick={() => setActiveThread(null)} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
          {activeThread.type === 'branch' ? <GroupIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {activeThread.name}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
            {activeThread.type === 'branch' ? 'Групповой чат' : 'Личный чат'}
          </Typography>
        </Box>
        <Chip 
          size="small" 
          label={status} 
          color={getStatusColor()} 
          sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.65rem' } }}
        />
      </Box>

      <Box sx={widgetStyles.messagesArea}>
        {messages.length === 0 && (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              Сообщений пока нет
            </Typography>
          </Box>
        )}
        
        {messages.map((msg) => (
          <Box key={msg.id} sx={widgetStyles.messageBubble(msg.isOwn)}>
            {!msg.isOwn && (
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5, opacity: 0.9 }}>
                {msg.senderName}
              </Typography>
            )}
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              {msg.text}
            </Typography>
            {msg.files && msg.files.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5, opacity: 0.9 }}>
                {msg.files.map((file) => (
                  <Box key={file.publicId} sx={{ display: 'flex', alignItems: 'flex-start', mt: 0.5 }}>
                    {isImageFile(file.fileName) ? (
                      <AuthenticatedImage
                        schoolPublicId={activeThread.schoolPublicId}
                        filePublicId={file.publicId}
                        alt={file.fileName}
                        onClick={() => setPreviewImageFileId(file.publicId)}
                        sx={{
                          width: '100%',
                          maxWidth: '180px',
                          maxHeight: '130px',
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
                        onClick={() => filesEndpoints.downloadFile(activeThread.schoolPublicId, file.publicId, file.fileName)}
                      >
                        <AttachFileIcon sx={{ fontSize: '0.8rem', transform: 'rotate(45deg)' }} />
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'inherit',
                            fontSize: '0.7rem',
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
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7, fontSize: '0.65rem' }}>
              {formatMessageTime(msg.receivedAt)}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <ChatInput
        onSendMessage={sendMessage}
        disabled={status !== 'connected'}
        schoolPublicId={activeThread?.schoolPublicId || ''}
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
    </>
  );
}
