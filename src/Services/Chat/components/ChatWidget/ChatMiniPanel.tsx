import { Paper } from '@mui/material';
import { useChatContext } from '@/Storage/Context/useChatContext';
import ChatList from '../ChatList/ChatList';
import ChatThreadView from '../ChatThreadView/ChatThreadView';
import { widgetStyles } from './ChatWidget.styles';

interface ChatMiniPanelProps {
  schoolId: number;
  schoolPublicId: string;
}

export default function ChatMiniPanel({ schoolId, schoolPublicId }: ChatMiniPanelProps) {
  const { activeThread } = useChatContext();

  return (
    <Paper sx={widgetStyles.panel} elevation={6}>
      {activeThread ? (
        <ChatThreadView />
      ) : (
        <ChatList schoolId={schoolId} schoolPublicId={schoolPublicId} />
      )}
    </Paper>
  );
}
