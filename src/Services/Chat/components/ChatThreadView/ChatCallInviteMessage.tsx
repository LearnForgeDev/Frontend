import { Box, Button, Typography } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import type { ChatCallInvite } from '@/Services/Chat/Chat.types';
import {
  CHAT_CALL_INVITE_FALLBACK_TITLE,
  CHAT_CALL_INVITE_JOIN_TEXT,
} from './ChatCallInviteMessage.const';
import { styles } from './ChatCallInviteMessage.styles';

interface ChatCallInviteMessageProps {
  invite: ChatCallInvite;
}

export default function ChatCallInviteMessage({ invite }: ChatCallInviteMessageProps) {
  return (
    <Box sx={styles.root}>
      <Typography variant="body2" sx={styles.title}>
        {invite.title || CHAT_CALL_INVITE_FALLBACK_TITLE}
      </Typography>
      <Button
        href={invite.url}
        variant="contained"
        size="small"
        startIcon={<VideocamIcon />}
        sx={styles.button}
      >
        {CHAT_CALL_INVITE_JOIN_TEXT}
      </Button>
    </Box>
  );
}
