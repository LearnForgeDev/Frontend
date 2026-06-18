import { Fab, Zoom, Box } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { useChatContext } from '@/Storage/Context/useChatContext';
import ChatMiniPanel from './ChatMiniPanel';
import { widgetStyles } from './ChatWidget.styles';
import { CSS } from '@/Services/Chat/Chat.const';

interface ChatWidgetProps {
  schoolId: number;
  schoolPublicId: string;
}

export default function ChatWidget({ schoolId, schoolPublicId }: ChatWidgetProps) {
  const { isMiniOpen, setMiniOpen } = useChatContext();

  return (
    <Box sx={widgetStyles.container}>
      <Zoom in={isMiniOpen} unmountOnExit>
        <Box className={CSS.miniPanel}>
          <ChatMiniPanel schoolId={schoolId} schoolPublicId={schoolPublicId} />
        </Box>
      </Zoom>

      <Fab
        color="primary"
        className={CSS.fab}
        onClick={() => setMiniOpen(!isMiniOpen)}
      >
        {isMiniOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>
    </Box>
  );
}
