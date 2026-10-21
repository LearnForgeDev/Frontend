import { Avatar, Box, Chip, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import type { ChatThread } from '@/Services/Chat/Chat.types';
import { useActiveChat } from '@/Services/Chat/hooks/useActiveChat/useActiveChat';
import ChatCallInviteButton from '@/Services/Chat/components/ChatCallInviteButton/ChatCallInviteButton';
import ChatInput from '@/Services/Chat/components/ChatThreadView/ChatInput';
import ChatMessageText from '@/Services/Chat/components/ChatThreadView/ChatMessageText';
import ChatMessageAttachments from '@/Services/Chat/components/ChatThreadView/ChatMessageAttachments';
import ChatImagePreview from '@/Services/Chat/components/ChatThreadView/ChatImagePreview';
import { formatChatMessageTime, getChatStatusColor, getChatStatusLabel } from '@/Services/Chat/components/ChatThreadView/ChatThreadView.utils';
import { styles as pageStyles } from '../../ChatsPage.styles';
import { styles } from './ActiveChatView.styles';

interface ActiveChatViewProps {
  activeThread: ChatThread;
  isMobile: boolean;
  onBack: () => void;
}

export default function ActiveChatView({ activeThread, isMobile, onBack }: ActiveChatViewProps) {
  const { messages, status, call, downloadFile, messagesEndRef, previewImage, previewImageFileId, closePreview, sendMessage } = useActiveChat(activeThread);
  return <Box sx={styles.root}>
    <Box sx={pageStyles.chatHeader}>
      {isMobile && <IconButton onClick={onBack} size="small" sx={styles.back} aria-label="К списку чатов"><ArrowBackIcon /></IconButton>}
      <Avatar sx={styles.avatar}>{activeThread.type === 'branch' ? <GroupIcon /> : <PersonIcon />}</Avatar>
      <Box sx={pageStyles.chatHeaderIdentity}>
        <Typography variant="subtitle1" sx={pageStyles.chatHeaderTitle} noWrap>{activeThread.name}</Typography>
        <Typography variant="caption" color="text.secondary" sx={styles.subtitle}>{activeThread.type === 'branch' ? 'Групповой чат' : 'Личный чат'}</Typography>
      </Box>
      <ChatCallInviteButton onClick={call.createCallInvite} disabled={status !== 'connected'} isPending={call.isPending} />
      <Chip label={getChatStatusLabel(status)} color={getChatStatusColor(status)} size="small" sx={styles.status} />
    </Box>
    <Box sx={pageStyles.messagesArea}>
      {messages.length === 0 && <Box sx={styles.empty}><Typography variant="body2">Сообщений пока нет. Начните диалог первым!</Typography></Box>}
      {messages.map(message => <Box key={message.id} sx={pageStyles.messageBubbleContainer(message.isOwn)}>
        <Box sx={pageStyles.messageBubble(message.isOwn)}>
          {!message.isOwn && <Typography variant="caption" sx={pageStyles.messageSender}>{message.senderName}</Typography>}
          <ChatMessageText text={message.text} />
          <ChatMessageAttachments files={message.files} schoolPublicId={activeThread.schoolPublicId} onPreview={previewImage} onDownload={downloadFile} />
          <Typography variant="caption" sx={pageStyles.messageTime}>{formatChatMessageTime(message.receivedAt)}</Typography>
        </Box>
      </Box>)}
      <div ref={messagesEndRef} />
    </Box>
    <ChatInput draftKey={`${activeThread.schoolPublicId}:${activeThread.type}:${activeThread.id}`} onSendMessage={sendMessage} disabled={status !== 'connected'} schoolPublicId={activeThread.schoolPublicId} />
    <ChatImagePreview schoolPublicId={activeThread.schoolPublicId} filePublicId={previewImageFileId} onClose={closePreview} />
  </Box>;
}
