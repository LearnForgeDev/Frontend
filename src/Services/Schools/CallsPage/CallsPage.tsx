import { Box, Typography, Button, Paper } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { useParams } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ErrorIcon from '@mui/icons-material/Error';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import CallsInviteDialog from './components/CallsInviteDialog/CallsInviteDialog';
import { useCallSession } from './hooks/useCallSession';
import { CALL_INVITE_LOADER_SIZE, CALL_LOADER_SIZE } from './hooks/useCallSession.const';
import { styles } from './CallsPage.styles';

export default function CallsPage() {
  const { schoolPublicId = '' } = useParams<{ schoolPublicId: string }>();
  const {
    pageRef, containerRef, activeRoom, activeCallTitle, isPending, callError, isConnected,
    isFullscreen, toggleFullscreen, retry, close, invites, isInviteDialogOpen, openInvite,
    closeInvite, sendInvite,
  } = useCallSession(schoolPublicId);

  return (
    <Box ref={pageRef} sx={styles.container}>
      {isPending && (
        <Box sx={styles.loadingBox}>
          <ClipLoader color="var(--app-primary)" size={CALL_LOADER_SIZE} />
          <Typography variant="h6" color="text.secondary">
            Подключение к звонку...
          </Typography>
        </Box>
      )}

      {!isPending && callError && (
        <Paper sx={styles.errorCard}>
          <ErrorIcon color="error" sx={styles.errorIcon} />
          <Typography variant="h6" color="error">
            Не удалось войти в звонок
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {callError}
          </Typography>
          <Box sx={styles.errorActions}>
            <Button
              variant="contained"
              onClick={retry}
            >
              Попробовать снова
            </Button>
            <Button
              variant="outlined"
              onClick={close}
            >
              Закрыть
            </Button>
          </Box>
        </Paper>
      )}

      {!isPending && !callError && !isConnected && (
        <Paper sx={styles.emptyCard}>
          <Typography variant="h6" sx={styles.emptyTitle}>
            Звонок не выбран
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Создайте конференцию в чате или откройте ссылку приглашения.
          </Typography>
        </Paper>
      )}

      {!isPending && isConnected && (
        <Box sx={styles.callLayout}>
          <Box sx={styles.callHeaderBar(isFullscreen)}>
            <Typography variant="subtitle1" sx={styles.callTitle}>
              {activeCallTitle || `Комната: ${activeRoom}`}
            </Typography>
            <Box sx={styles.callActions}>
              <Button
                variant="outlined"
                size="small"
                startIcon={isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                onClick={toggleFullscreen}
              >
                {isFullscreen ? 'Свернуть' : 'На весь экран'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={invites.isPending ? <ClipLoader size={CALL_INVITE_LOADER_SIZE} color="var(--app-primary)" /> : <PersonAddIcon />}
                disabled={invites.isDisabled || !activeRoom}
                onClick={openInvite}
              >
                Пригласить
              </Button>
            </Box>
          </Box>

          <Box ref={containerRef} sx={styles.jitsiContainer} />
          <CallsInviteDialog
            open={isInviteDialogOpen}
            recipients={invites.recipients}
            isPending={invites.isPending}
            onClose={closeInvite}
            onInvite={sendInvite}
          />
        </Box>
      )}
    </Box>
  );
}
