import { Paper } from '@mui/material';
import { useChatContext } from '@/Storage/useChatContext/useChatContext.tsx';
import ChatList from '../ChatList/ChatList';
import ChatThreadView from '../ChatThreadView/ChatThreadView';
import { widgetStyles } from './ChatWidget.styles';

interface ChatMiniPanelProps {
  schoolPublicId: string;
}

export default function ChatMiniPanel({ schoolPublicId }: ChatMiniPanelProps) {
  const { activeThread } = useChatContext();

  return (
    <Paper sx={widgetStyles.panel} elevation={6}>
      {activeThread ? (
        <ChatThreadView />
      ) : (
        <ChatList schoolPublicId={schoolPublicId} />
      )}
    </Paper>
  );
}
