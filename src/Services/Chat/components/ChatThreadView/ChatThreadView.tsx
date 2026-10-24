import { Avatar, Box, Chip, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { useChatContext } from '@/Storage/useChatContext/useChatContext';
import { useActiveChat } from '../../hooks/useActiveChat/useActiveChat';
import ChatCallInviteButton from '../ChatCallInviteButton/ChatCallInviteButton';
import ChatInput from './ChatInput';
import ChatMessageText from './ChatMessageText';
import ChatMessageAttachments from './ChatMessageAttachments';
import ChatImagePreview from './ChatImagePreview';
import { formatChatMessageTime, getChatStatusColor, getChatStatusLabel } from './ChatThreadView.utils';
import { widgetStyles } from '../ChatWidget/ChatWidget.styles';
import { styles } from './ChatThreadView.styles';

export default function ChatThreadView() {
  const { activeThread, setActiveThread } = useChatContext();
  const { messages, status, call, downloadFile, messagesEndRef, previewImage, previewImageFileId, closePreview, sendMessage } = useActiveChat(activeThread);
  if (!activeThread) return null;
  return <>
    <Box sx={widgetStyles.header}>
      <IconButton color="inherit" onClick={() => setActiveThread(null)} edge="start" aria-label="К списку чатов"><ArrowBackIcon /></IconButton>
      <Avatar sx={styles.avatar}>{activeThread.type === 'branch' ? <GroupIcon fontSize="small" /> : <PersonIcon fontSize="small" />}</Avatar>
      <Box sx={styles.identity}>
        <Typography variant="subtitle2" noWrap>{activeThread.name}</Typography>
        <Typography variant="caption" sx={styles.subtitle}>{activeThread.type === 'branch' ? 'Групповой чат' : 'Личный чат'}</Typography>
      </Box>
      <ChatCallInviteButton onClick={call.createCallInvite} disabled={status !== 'connected'} isPending={call.isPending} />
      <Chip size="small" label={getChatStatusLabel(status)} color={getChatStatusColor(status)} sx={styles.status} />
    </Box>
    <Box sx={widgetStyles.messagesArea}>
      {messages.length === 0 && <Box sx={styles.empty}><Typography color="text.secondary" variant="body2">Сообщений пока нет</Typography></Box>}
      {messages.map(message => <Box key={message.id} sx={widgetStyles.messageBubble(message.isOwn)}>
        {!message.isOwn && <Typography variant="caption" sx={styles.sender}>{message.senderName}</Typography>}
        <ChatMessageText text={message.text} />
        <ChatMessageAttachments files={message.files} schoolPublicId={activeThread.schoolPublicId} compact onPreview={previewImage} onDownload={downloadFile} />
        <Typography variant="caption" sx={styles.time}>{formatChatMessageTime(message.receivedAt)}</Typography>
      </Box>)}
      <div ref={messagesEndRef} />
    </Box>
    <ChatInput draftKey={`${activeThread.schoolPublicId}:${activeThread.type}:${activeThread.id}`} onSendMessage={sendMessage} disabled={status !== 'connected'} schoolPublicId={activeThread.schoolPublicId} />
    <ChatImagePreview schoolPublicId={activeThread.schoolPublicId} filePublicId={previewImageFileId} onClose={closePreview} />
  </>;
}
