import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Paper } from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ErrorIcon from '@mui/icons-material/Error';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
import config from '../../../config';

import {
  CUSTOM_INVITE_BUTTON_ELEMENT_ID,
  CUSTOM_INVITE_BUTTON_ID,
  INVITE_BUTTON_ICON,
  JITSI_SCRIPT_ID,
  ROOM_NOT_CREATED_MESSAGE,
} from './CallsPage.constants';
import { useCreateCall } from './hooks/useCreateCall';
import { useBroadcastCallInvite } from './hooks/useBroadcastCallInvite/useBroadcastCallInvite';
import CallsInviteDialog from './components/CallsInviteDialog/CallsInviteDialog';
import type { JitsiApi } from './typings';

import { styles } from './CallsPage.styles';

const logger = createDebugger('CallsPage');

interface CallConnectionState {
  room: string;
  url: string;
}

interface CallErrorState {
  room: string;
  message: string;
}

function loadJitsiScript(domain: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) {
      resolve();
      return;
    }
    let script = document.getElementById(JITSI_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = JITSI_SCRIPT_ID;
      script.src = `https://${domain}/external_api.js`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    } else {
      script.addEventListener('load', () => resolve());
    }
  });
}

export default function CallsPage() {
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const roomFromQuery = searchParams.get('room');
  const titleFromQuery = searchParams.get('title');
  const activeRoom = roomFromQuery?.trim() || null;
  const activeCallTitle = titleFromQuery?.trim() || null;
  const [connectionState, setConnectionState] = useState<CallConnectionState | null>(null);
  const [callErrorState, setCallErrorState] = useState<CallErrorState | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const roomUrl = connectionState?.room === activeRoom ? connectionState.url : null;
  const callError = callErrorState?.room === activeRoom ? callErrorState.message : null;

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<JitsiApi | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { mutate: createCall, isPending } = useCreateCall();
  const {
    recipients,
    broadcastInvite,
    isPending: isInvitePending,
    isDisabled: isInviteDisabled,
  } = useBroadcastCallInvite(schoolPublicId || '');

  const handleOpenInviteDialog = useCallback(() => {
    setIsInviteDialogOpen(true);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }

    pageRef.current?.requestFullscreen();
  }, []);

  const startCall = useCallback((roomName: string) => {
    const trimmedRoomName = roomName.trim();

    if (!schoolPublicId || !trimmedRoomName) return;
    setCallErrorState(null);

    createCall(
      { schoolPublicId, room: trimmedRoomName },
      {
        onSuccess: (url) => {
          setConnectionState({ room: trimmedRoomName, url });
        },
        onError: () => {
          setCallErrorState({ room: trimmedRoomName, message: ROOM_NOT_CREATED_MESSAGE });
          setConnectionState(null);
        },
      }
    );
  }, [schoolPublicId, createCall]);

  useEffect(() => {
    if (activeRoom && !roomUrl && !isPending && !callError && schoolPublicId) {
      createCall(
        { schoolPublicId, room: activeRoom },
        {
          onSuccess: (url) => {
            setConnectionState({ room: activeRoom, url });
          },
          onError: () => {
            setCallErrorState({ room: activeRoom, message: ROOM_NOT_CREATED_MESSAGE });
            setConnectionState(null);
          },
        }
      );
    }
  }, [activeRoom, roomUrl, isPending, callError, schoolPublicId, createCall]);

  const jitsiConfig = useMemo(() => {
    if (!roomUrl) return null;
    try {
      const url = new URL(roomUrl);
      const domain = config.meetServerUrl ? new URL(config.meetServerUrl).host : url.host;
      const roomName = url.pathname.substring(1);
      const jwt = url.searchParams.get('jwt') || undefined;
      return { domain, roomName, jwt };
    } catch (e) {
      logger.logEventForDebug(DebugSeverity.DANGER, 'Failed to parse Jitsi URL', e);
      return null;
    }
  }, [roomUrl]);

  const handleSendInvite = useCallback((recipientUserPublicIds: string[]) => {
    const roomToShare = activeRoom || jitsiConfig?.roomName;

    if (!roomToShare) return;

    broadcastInvite({
      room: roomToShare,
      title: activeCallTitle,
      recipientUserPublicIds,
    });
    setIsInviteDialogOpen(false);
  }, [activeCallTitle, activeRoom, broadcastInvite, jitsiConfig?.roomName]);

  useEffect(() => {
    if (!jitsiConfig || !containerRef.current) return;

    let isMounted = true;
    const { domain, roomName, jwt } = jitsiConfig;

    loadJitsiScript(domain)
      .then(() => {
        if (!isMounted || !containerRef.current) return;

        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
          jitsiApiRef.current = null;
        }

        containerRef.current.replaceChildren();

        if (!window.JitsiMeetExternalAPI) return;

        const api = new window.JitsiMeetExternalAPI(domain, {
          roomName,
          jwt,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            defaultLanguage: 'ru',
            hideConferenceSubject: true,
            subject: '',
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            SHOW_ROOM_NAME: false,
            DEFAULT_LOGO_URL: '',
            DEFAULT_WELCOME_PAGE_LOGO_URL: '',
          },
          lang: 'ru',
        });

        jitsiApiRef.current = api;

        api.addEventListener('videoConferenceJoined', () => {
          logger.logEventForDebug(DebugSeverity.NEUTRAL, 'Joined Jitsi Conference', roomName);
          try {
            api.registerCustomToolbarButton?.({
              id: CUSTOM_INVITE_BUTTON_ID,
              text: 'Пригласить',
              icon: INVITE_BUTTON_ICON,
              btnId: CUSTOM_INVITE_BUTTON_ELEMENT_ID,
            });
          } catch (e) {
            logger.logEventForDebug(DebugSeverity.WARNING, 'Failed to register custom toolbar button', e);
          }
        });

        api.addEventListener('customToolbarButtonClicked', (event) => {
          if (event.id === CUSTOM_INVITE_BUTTON_ID) {
            handleOpenInviteDialog();
          }
        });

        api.addEventListener('videoConferenceLeft', () => {
          if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
          }
          setConnectionState(null);
          setCallErrorState(null);
          setSearchParams({});
        });
      })
      .catch((err) => {
        logger.logEventForDebug(DebugSeverity.DANGER, 'Failed to load Jitsi external_api.js', err);
        setCallErrorState({
          room: activeRoom || jitsiConfig.roomName,
          message: 'Не удалось загрузить клиент видеозвонка.',
        });
      });

    return () => {
      isMounted = false;
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [jitsiConfig, activeRoom, handleOpenInviteDialog, setSearchParams]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === pageRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleLeaveCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    setConnectionState(null);
    setCallErrorState(null);
    setSearchParams({});
  };

  return (
    <Box ref={pageRef} sx={styles.container}>
      {isPending && (
        <Box sx={styles.loadingBox}>
          <CircularProgress size={48} />
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
              onClick={() => {
                if (activeRoom) startCall(activeRoom);
              }}
            >
              Попробовать снова
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setCallErrorState(null);
                setSearchParams({});
              }}
            >
              Закрыть
            </Button>
          </Box>
        </Paper>
      )}

      {!isPending && !callError && !jitsiConfig && (
        <Paper sx={styles.emptyCard}>
          <Typography variant="h6" sx={styles.emptyTitle}>
            Звонок не выбран
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Создайте конференцию в чате или откройте ссылку приглашения.
          </Typography>
        </Paper>
      )}

      {!isPending && jitsiConfig && (
        <Box sx={styles.callLayout}>
          <Box sx={styles.callHeaderBar}>
            <Typography variant="subtitle1" sx={styles.callTitle}>
              {activeCallTitle || `Комната: ${activeRoom || jitsiConfig.roomName}`}
            </Typography>
            <Box sx={styles.callActions}>
              <Button
                variant="outlined"
                size="small"
                startIcon={isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                onClick={handleToggleFullscreen}
              >
                {isFullscreen ? 'Свернуть' : 'На весь экран'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={isInvitePending ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
                disabled={isInviteDisabled || (!activeRoom && !jitsiConfig.roomName)}
                onClick={handleOpenInviteDialog}
              >
                Пригласить
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<CallEndIcon />}
                onClick={handleLeaveCall}
              >
                Покинуть
              </Button>
            </Box>
          </Box>

          <Box ref={containerRef} sx={styles.jitsiContainer} />
          <CallsInviteDialog
            open={isInviteDialogOpen}
            recipients={recipients}
            isPending={isInvitePending}
            onClose={() => setIsInviteDialogOpen(false)}
            onInvite={handleSendInvite}
          />
        </Box>
      )}
    </Box>
  );
}
