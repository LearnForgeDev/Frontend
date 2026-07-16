import { useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Avatar, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useChatContext } from '@/Storage/useChatContext/useChatContext.tsx';
import { useChatMessages } from '@/Services/Chat/hooks/useChatMessages/useChatMessages';
import ChatInput from './ChatInput';
import { widgetStyles } from '../ChatWidget/ChatWidget.styles';

export default function ChatThreadView() {
  const { activeThread, setActiveThread } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChatMessages({
    type: activeThread?.type || 'branch',
    threadId: activeThread?.id || '',
    schoolPublicId: activeThread?.schoolPublicId || '',
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5, borderTop: '1px solid currentColor', pt: 0.5, opacity: 0.9 }}>
                {msg.files.map((file) => (
                  <Box key={file.publicId} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AttachFileIcon sx={{ fontSize: '0.9rem', transform: 'rotate(45deg)' }} />
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'inherit',
                        fontSize: '0.75rem',
                        textDecoration: 'underline',
                        wordBreak: 'break-all',
                      }}
                    >
                      {file.fileName || 'Вложенный файл'}
                    </a>
                  </Box>
                ))}
              </Box>
            )}
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7, fontSize: '0.65rem' }}>
              {new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <ChatInput onSendMessage={sendMessage} disabled={status !== 'connected'} />
    </>
  );
}
