import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Paper } from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ErrorIcon from '@mui/icons-material/Error';
import { useCreateCall } from './hooks/useCreateCall';
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';
import config from '../../../config';
import { styles } from './CallsPage.styles';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';

const logger = createDebugger('CallsPage');

interface JitsiApi {
  dispose: () => void;
  executeCommand: (command: string) => void;
  addEventListener: (event: string, listener: (...args: unknown[]) => void) => void;
  registerCustomToolbarButton?: (button: { id: string; text: string; icon: string; btnId: string }) => void;
}

interface JitsiMeetExternalAPIConstructor {
  new (domain: string, options: unknown): JitsiApi;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiMeetExternalAPIConstructor;
  }
}

function loadJitsiScript(domain: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) {
      resolve();
      return;
    }
    const scriptId = 'jitsi-external-api-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
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

  const [roomNameInput, setRoomNameInput] = useState(roomFromQuery || '');
  const [prevRoomFromQuery, setPrevRoomFromQuery] = useState(roomFromQuery);
  const [activeRoom, setActiveRoom] = useState<string | null>(roomFromQuery);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [callError, setCallError] = useState<string | null>(null);

  if (roomFromQuery !== prevRoomFromQuery) {
    setPrevRoomFromQuery(roomFromQuery);
    if (roomFromQuery) {
      setRoomNameInput(roomFromQuery);
      setActiveRoom(roomFromQuery);
      setCallError(null);
    }
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<JitsiApi | null>(null);

  const { mutate: createCall, isPending } = useCreateCall();
  const showNotification = useGlobalNotificationStore((s) => s.pushNotification);

  const handleCopyInviteLink = useCallback((roomToShare: string) => {
    if (!schoolPublicId || !roomToShare) return;
    const inviteUrl = `${window.location.origin}/schools/${schoolPublicId}/calls?room=${encodeURIComponent(roomToShare)}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      showNotification({
        id: `invite-copied-${Date.now()}`,
        title: 'Ссылка скопирована',
        subtitle: 'Ссылка на приглашение в звонок скопирована в буфер обмена.',
        priority: 'low',
        time: 3000,
      });
    });
  }, [schoolPublicId, showNotification]);

  const startCall = useCallback((roomName: string) => {
    if (!schoolPublicId || !roomName.trim()) return;
    setCallError(null);
    setActiveRoom(roomName.trim());

    createCall(
      { schoolPublicId, room: roomName.trim() },
      {
        onSuccess: (url) => {
          setRoomUrl(url);
        },
        onError: (err) => {
          setCallError(err?.message || 'Комната ещё не создана преподавателем или недоступна.');
          setRoomUrl(null);
        },
      }
    );
  }, [schoolPublicId, createCall]);

  // Handle URL query parameter room on mount/change
  useEffect(() => {
    if (roomFromQuery && !roomUrl && !isPending && !callError && schoolPublicId) {
      createCall(
        { schoolPublicId, room: roomFromQuery.trim() },
        {
          onSuccess: (url) => {
            setRoomUrl(url);
          },
          onError: (err) => {
            setCallError(err?.message || 'Комната ещё не создана преподавателем или недоступна.');
            setRoomUrl(null);
          },
        }
      );
    }
  }, [roomFromQuery, roomUrl, isPending, callError, schoolPublicId, createCall]);

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

  // Embed Jitsi Iframe once config is ready
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

        containerRef.current.innerHTML = '';

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
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
          },
        });

        jitsiApiRef.current = api;

        api.addEventListener('videoConferenceJoined', () => {
          logger.logEventForDebug(DebugSeverity.NEUTRAL, 'Joined Jitsi Conference', roomName);
          try {
            api.registerCustomToolbarButton({
              id: 'custom-invite-btn',
              text: 'Пригласить',
              icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24" fill="%23ffffff"><path d="M720 656v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Zm-360 0q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM40 896v-112q0-34 17.5-62.5T106 678q75-38 152.5-58T416 600q30 0 60 3.5t60 10.5q-13 18-20.5 39T508 698q-23-5-46-7.5T416 688q-65 0-128.5 16.5T164 748v36h348q9 22 22 41t30 31H40Z"/></svg>',
              btnId: 'btn-invite-custom',
            });
          } catch (e) {
            logger.logEventForDebug(DebugSeverity.WARNING, 'Failed to register custom toolbar button', e);
          }
        });

        api.addEventListener('customToolbarButtonClicked', (event: { id: string }) => {
          if (event.id === 'custom-invite-btn') {
            handleCopyInviteLink(activeRoom || roomName);
          }
        });

        api.addEventListener('videoConferenceLeft', () => {
          if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
          }
          setRoomUrl(null);
          setActiveRoom(null);
          setSearchParams({});
        });
      })
      .catch((err) => {
        logger.logEventForDebug(DebugSeverity.DANGER, 'Failed to load Jitsi external_api.js', err);
        setCallError('Не удалось загрузить клиент видеозвонка.');
      });

    return () => {
      isMounted = false;
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [jitsiConfig, activeRoom, handleCopyInviteLink, setSearchParams]);

  const handleLeaveCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    setRoomUrl(null);
    setActiveRoom(null);
    setSearchParams({});
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNameInput.trim()) return;
    setSearchParams({ room: roomNameInput.trim() });
    startCall(roomNameInput.trim());
  };

  return (
    <Box sx={styles.container}>
      <Typography variant="h4" component="h1" sx={styles.header}>
        Звонки
      </Typography>

      {/* State 1: Loading Call Token */}
      {isPending && (
        <Box sx={styles.loadingBox}>
          <CircularProgress size={48} />
          <Typography variant="h6" color="text.secondary">
            Подключение к звонку...
          </Typography>
        </Box>
      )}

      {/* State 2: Error joining room */}
      {!isPending && callError && (
        <Paper sx={styles.errorCard}>
          <ErrorIcon color="error" sx={{ fontSize: 56 }} />
          <Typography variant="h6" color="error">
            Не удалось войти в звонок
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {callError}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
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
                setCallError(null);
                setActiveRoom(null);
                setSearchParams({});
              }}
            >
              К списку звонков
            </Button>
          </Box>
        </Paper>
      )}

      {/* State 3: Room Input Form when not in a call */}
      {!isPending && !callError && !jitsiConfig && (
        <Paper component="form" onSubmit={handleFormSubmit} sx={styles.formCard}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Присоединиться или создать звонок
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Введите название комнаты для нового звонка или подключения к существующему.
          </Typography>

          <TextField
            label="Название комнаты"
            variant="outlined"
            fullWidth
            value={roomNameInput}
            onChange={(e) => setRoomNameInput(e.target.value)}
            placeholder="Например: Math-101"
            disabled={isPending}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            color="primary"
            disabled={!roomNameInput.trim() || isPending || !schoolPublicId}
          >
            Войти в звонок
          </Button>
        </Paper>
      )}

      {/* State 4: Active Call with Jitsi Iframe */}
      {!isPending && jitsiConfig && (
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
          <Box sx={styles.callHeaderBar}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Комната: {activeRoom || jitsiConfig.roomName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => handleCopyInviteLink(activeRoom || jitsiConfig.roomName)}
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
        </Box>
      )}
    </Box>
  );
}
