import { Link, Typography } from '@mui/material';
import { parseChatCallInvite, splitChatMessageText } from './ChatThreadView.utils';
import ChatCallInviteMessage from './ChatCallInviteMessage';
import { styles } from './ChatMessageText.styles';

interface ChatMessageTextProps {
  text: string;
}

export default function ChatMessageText({ text }: ChatMessageTextProps) {
  const callInvite = parseChatCallInvite(text);
  const parts = splitChatMessageText(text);

  if (callInvite) {
    return <ChatCallInviteMessage invite={callInvite} />;
  }

  return (
    <Typography variant="body2" sx={styles.text}>
      {parts.map((part, index) => {
        if (part.type === 'link') {
          return (
            <Link key={`${part.value}-${index}`} href={part.value} target="_blank" rel="noopener noreferrer" sx={styles.link}>
              {part.value}
            </Link>
          );
        }

        return part.value;
      })}
    </Typography>
  );
}
