import { Box, Typography } from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import { useChatsWorkspace } from '../../hooks/useChatsWorkspace';
import ActiveChatView from '../ActiveChatView/ActiveChatView';
import ChatsSidebar from '../ChatsSidebar/ChatsSidebar';
import ChatCreationDialogs from '../ChatCreationDialogs/ChatCreationDialogs';
import { styles as pageStyles } from '../../ChatsPage.styles';
import { styles } from './ChatsWorkspace.styles';

export default function ChatsWorkspace({ schoolPublicId }: { schoolPublicId: string }) {
  const view = useChatsWorkspace(schoolPublicId);
  return <Box sx={pageStyles.container}>
    <Box sx={pageStyles.chatLayout}>
      <Box sx={styles.sidebar(view.isMobile, Boolean(view.activeThread))}><ChatsSidebar view={view} /></Box>
      <Box sx={styles.area(view.isMobile, Boolean(view.activeThread))}>
        {view.activeThread ? <ActiveChatView activeThread={view.activeThread} isMobile={view.isMobile} onBack={view.closeThread} /> :
          <Box sx={pageStyles.placeholderArea}>
            <ForumIcon sx={styles.placeholderIcon} />
            <Typography variant="h6" color="text.secondary">Выберите диалог из списка</Typography>
            <Typography variant="body2" color="text.secondary">{view.activeTab === 'branch' ? 'Или создайте новую группу с помощью кнопки «Создать»' : 'Или выберите собеседника с помощью кнопки «Написать»'}</Typography>
          </Box>}
      </Box>
    </Box>
    <ChatCreationDialogs view={view} />
  </Box>;
}
