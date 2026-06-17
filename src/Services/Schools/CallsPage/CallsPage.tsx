import { useState, useMemo } from 'react';
import { Box, Typography, TextField, Button, IconButton, Tooltip } from '@mui/material';
import { useParams } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useCreateCall } from './hooks/useCreateCall';
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';
import { useGlobalContext } from '@/Storage/Context/useGlobalContext';
import { styles } from './CallsPage.styles';

export default function CallsPage() {
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();
  const [roomNameInput, setRoomNameInput] = useState('');
  const [roomUrl, setRoomUrl] = useState<string | null>(null);

  const { mutate: createCall, isPending } = useCreateCall();
  const showNotification = useGlobalNotificationStore((s) => s.pushNotification);
  const currentUser = useGlobalContext((s) => s.auth.user);

  const handleCreateCall = () => {
    if (!schoolPublicId || !roomNameInput.trim()) return;

    createCall(
      { schoolPublicId, Room: roomNameInput.trim() },
      {
        onSuccess: (url) => {
          setRoomUrl(url);
          showNotification({
            id: `call-created-${Date.now()}`,
            title: 'Call Created',
            subtitle: 'Meeting link is ready and the call is embedded below.',
            priority: 'low',
            time: 3000,
          });
        },
      }
    );
  };

  const handleCopyLink = () => {
    if (!roomUrl) return;
    navigator.clipboard.writeText(roomUrl).then(() => {
      showNotification({
        id: `copied-${Date.now()}`,
        title: 'Link Copied',
        subtitle: 'The meeting link has been copied to your clipboard.',
        priority: 'low',
        time: 3000,
      });
    });
  };

  const jitsiConfig = useMemo(() => {
    if (!roomUrl) return null;
    try {
      const url = new URL(roomUrl);
      const domain = url.hostname;
      const roomName = url.pathname.substring(1);
      const jwt = url.searchParams.get('jwt') || undefined;
      return { domain, roomName, jwt };
    } catch (e) {
      console.error("Failed to parse Jitsi URL", e);
      return null;
    }
  }, [roomUrl]);

  return (
    <Box sx={styles.container}>
      <Typography variant="h4" component="h1" sx={styles.header}>
        Звонки
      </Typography>

      {!jitsiConfig && (
        <Box sx={styles.formCard}>
          <Typography variant="body1" color="text.secondary">
            Создайте новую комнату для звонка и присоединяйтесь прямо здесь.
          </Typography>

          <TextField
            label="Название комнаты"
            variant="outlined"
            fullWidth
            value={roomNameInput}
            onChange={(e) => setRoomNameInput(e.target.value)}
            placeholder="Например: Урок математики"
            disabled={isPending}
          />

          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={handleCreateCall}
            disabled={!roomNameInput.trim() || isPending || !schoolPublicId}
          >
            {isPending ? 'Создание...' : 'Создать звонок и войти'}
          </Button>
        </Box>
      )}

      {roomUrl && jitsiConfig && (
        <>
          <Box sx={styles.resultBox}>
            <Typography variant="body2" sx={styles.urlText}>
              {roomUrl}
            </Typography>
            <Tooltip title="Копировать ссылку">
              <IconButton onClick={handleCopyLink} color="primary">
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Открыть в новой вкладке">
              <IconButton
                component="a"
                href={roomUrl}
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
              >
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={styles.jitsiContainer}>
            <JitsiMeeting
              domain={jitsiConfig.domain}
              roomName={jitsiConfig.roomName}
              jwt={jitsiConfig.jwt}
              userInfo={{
                displayName: currentUser?.userName || 'TutorPlatform User',
                email: 'example@gmail.com',
              }}
              getIFrameRef={(iframeRef) => {
                iframeRef.style.height = '100%';
                iframeRef.style.width = '100%';
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
