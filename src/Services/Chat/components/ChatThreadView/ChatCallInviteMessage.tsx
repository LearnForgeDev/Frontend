import type { ChatCallInviteMessageProps } from './ChatCallInviteMessage.type';
import { Box, Button, Typography } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';

import { CHAT_CALL_INVITE_FALLBACK_TITLE, CHAT_CALL_INVITE_JOIN_TEXT } from './ChatCallInviteMessage.const';
import { styles } from './ChatCallInviteMessage.styles';

export default function ChatCallInviteMessage({ invite }: ChatCallInviteMessageProps) {
  return (
    <Box sx={styles.root}>
      <Typography variant="body2" sx={styles.title}>
        {invite.title || CHAT_CALL_INVITE_FALLBACK_TITLE}
      </Typography>
      <Button
        data-testid="chat-call-join"
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
