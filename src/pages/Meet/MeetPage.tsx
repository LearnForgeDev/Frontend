import { useEffect, useMemo, useRef, useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import type { IJitsiMeetExternalApi } from '@jitsi/react-sdk/lib/types';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import SettingsIcon from '@mui/icons-material/Settings';
import { useParams, useSearchParams } from 'react-router-dom';

import { useUser } from '../../contexts/UserContext.tsx';
import { getMeetToken } from '../../endpoints/Meet.ts';
import type { MeetTokenResponse } from '../../types/meetTypes.ts';
import * as S from './MeetPage.styles.ts';

export default function MeetPage() {
  const apiRef = useRef<IJitsiMeetExternalApi | null>(null);
  const { user } = useUser();
  const { meetId } = useParams<{ meetId: string }>();
  const [searchParams] = useSearchParams();

  const [meet, setMeet] = useState<MeetTokenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const room = searchParams.get('room') ?? meetId ?? 'MyTestRoom';
  const schoolPublicId = searchParams.get('schoolPublicId') ?? '';

  useEffect(() => {
    if (!user?.jwtToken) {
      setError('Нужно войти в аккаунт');
      setIsLoading(false);
      return;
    }

    if (!schoolPublicId) {
      setError('Не указан schoolPublicId');
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    getMeetToken(user.jwtToken, { room, schoolPublicId })
      .then((data) => {
        if (active) setMeet(data);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Не удалось получить токен встречи');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [room, schoolPublicId, user?.jwtToken]);

  const canShareScreen = Boolean(
    meet?.permissions.canShareScreen ?? meet?.permissions.screenSharing,
  );

  const canApproveScreenSharing = Boolean(
    meet?.permissions.canApproveScreenSharing ?? meet?.permissions.moderator,
  );

  const toolbarButtons = useMemo(
    () =>
      canShareScreen
        ? ['microphone', 'camera', 'desktop', 'chat', 'participants-pane', 'tileview', 'settings', 'hangup']
        : ['microphone', 'camera', 'chat', 'participants-pane', 'tileview', 'settings', 'hangup'],
    [canShareScreen],
  );

  const handleShareScreen = () => {
    apiRef.current?.executeCommand('toggleShareScreen');
  };

  if (isLoading) {
    return (
      <Box sx={S.centerStateSx}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !meet) {
    return (
      <Box sx={S.centerStateSx}>
        <Alert severity="error">{error ?? 'Встреча недоступна'}</Alert>
      </Box>
    );
  }

  const permissions = meet.permissions;
  const meetDomain = new URL(meet.roomUrl).host;

  return (
    <Box sx={S.pageSx}>
      <Box sx={S.headerSx}>
        <Box>
          <Typography variant="h5" component="h1">
            {meet.room}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Доступ до {new Date(meet.expiresAt).toLocaleString()}
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {permissions.canCreateRoom && (
            <Button variant="outlined" startIcon={<AddIcon />}>
              Создать
            </Button>
          )}

          {permissions.canManageRoom && (
            <Button variant="outlined" startIcon={<SettingsIcon />}>
              Управление
            </Button>
          )}

          {canShareScreen && (
            <Button variant="contained" startIcon={<ScreenShareIcon />} onClick={handleShareScreen}>
              Демонстрация
            </Button>
          )}

          {permissions.canRequestScreenShare && (
            <Button variant="contained" startIcon={<ScreenShareIcon />}>
              Запросить демонстрацию
            </Button>
          )}
        </Stack>
      </Box>

      {canApproveScreenSharing && (
        <Alert severity="info" sx={S.moderatorAlertSx}>
          Здесь будет approve/reject UI для запросов демонстрации экрана.
        </Alert>
      )}

      <Box sx={S.meetingFrameSx}>
        <JitsiMeeting
          domain={meetDomain}
          roomName={meet.room}
          jwt={meet.token}
          userInfo={{
            displayName: user?.userName ?? 'LearnForge User',
            email: '',
          }}
          configOverwrite={{
            startWithAudioMuted: true,
            toolbarButtons,
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          }}
          onApiReady={(externalApi) => {
            apiRef.current = externalApi;
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
          }}
        />
      </Box>
    </Box>
  );
}