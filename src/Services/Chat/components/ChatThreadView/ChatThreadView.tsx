import { useEffect, useRef, useState } from 'react';
import { Box, Typography, IconButton, Avatar, Chip, Dialog } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useChatContext } from '@/Storage/useChatContext/useChatContext.tsx';
import { useChatMessages } from '@/Services/Chat/hooks/useChatMessages/useChatMessages';
import { useDownloadChatFile } from '@/Services/Chat/hooks/useDownloadChatFile/useDownloadChatFile';
import { useCreateChatCallInvite } from '@/Services/Chat/hooks/useCreateChatCallInvite/useCreateChatCallInvite';
import AuthenticatedImage from '@/Assets/Components/AuthenticatedImage';
import ChatInput from './ChatInput';
import ChatMessageText from './ChatMessageText';
import {
  formatChatMessageTime,
  getChatStatusColor,
  getChatStatusLabel,
  isImageFile,
} from './ChatThreadView.utils';
import { widgetStyles } from '../ChatWidget/ChatWidget.styles';

export default function ChatThreadView() {
  const { activeThread, setActiveThread } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChatMessages({
    type: activeThread?.type || 'branch',
    threadId: activeThread?.id || '',
    schoolPublicId: activeThread?.schoolPublicId || '',
  });

  const [previewImageFileId, setPreviewImageFileId] = useState<string | null>(null);
  const downloadChatFile = useDownloadChatFile(activeThread?.schoolPublicId || '');
  const createChatCallInvite = useCreateChatCallInvite({
    thread: activeThread,
    sendMessage,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeThread) return null;

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
          label={getChatStatusLabel(status)}
          color={getChatStatusColor(status)}
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
            <ChatMessageText text={msg.text} />
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
                        onClick={() => file.publicId && downloadChatFile(file.publicId, file.fileName)}
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
              {formatChatMessageTime(msg.receivedAt)}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <ChatInput
        onSendMessage={sendMessage}
        disabled={status !== 'connected'}
        schoolPublicId={activeThread?.schoolPublicId || ''}
        onCreateCallInvite={createChatCallInvite.createCallInvite}
        isCreateCallInvitePending={createChatCallInvite.isPending}
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
