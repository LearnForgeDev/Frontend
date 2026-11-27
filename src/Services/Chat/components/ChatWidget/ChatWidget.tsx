import type { ChatWidgetProps } from './ChatWidget.type';
import { Fab, Zoom, Box } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { useChatContext } from '@/Storage/useChatContext/useChatContext.tsx';
import ChatMiniPanel from './ChatMiniPanel';
import { widgetStyles } from './ChatWidget.styles';
import { CSS } from '@/Services/Chat/Chat.const';

export default function ChatWidget({ schoolPublicId }: ChatWidgetProps) {
  const { isMiniOpen, setMiniOpen } = useChatContext();

  return (
    <Box sx={widgetStyles.container}>
      <Fab
        color="primary"
        className={CSS.fab}
        aria-label={isMiniOpen ? 'Закрыть быстрый чат' : 'Открыть быстрый чат'}
        aria-expanded={isMiniOpen}
        aria-controls={isMiniOpen ? 'school-quick-chat' : undefined}
        sx={{ order: 1 }}
        onClick={() => setMiniOpen(!isMiniOpen)}
      >
        {isMiniOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>
      <Zoom in={isMiniOpen} unmountOnExit>
        <Box className={CSS.miniPanel} id="school-quick-chat" role="region" aria-label="Быстрый чат">
          <ChatMiniPanel schoolPublicId={schoolPublicId} />
        </Box>
      </Zoom>
    </Box>
  );
}
