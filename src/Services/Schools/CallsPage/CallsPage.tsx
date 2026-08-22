import { useState, useMemo, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Paper } from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ErrorIcon from '@mui/icons-material/Error';

import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
import config from '../../../config';
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';

import {
  CUSTOM_INVITE_BUTTON_ELEMENT_ID,
  CUSTOM_INVITE_BUTTON_ID,
  INVITE_BUTTON_ICON,
  JITSI_SCRIPT_ID,
  ROOM_NOT_CREATED_MESSAGE,
} from './CallsPage.constants';
import { useCreateCall } from './hooks/useCreateCall';
import type { JitsiApi } from './typings';

import { styles } from './CallsPage.styles';

const logger = createDebugger('CallsPage');

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
    }).catch(() => {
      showNotification({
        id: `invite-copy-error-${Date.now()}`,
        title: 'Не удалось скопировать ссылку',
        subtitle: 'Скопируйте ссылку приглашения вручную.',
        priority: 'high',
        time: 5000,
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
        onError: () => {
          setCallError(ROOM_NOT_CREATED_MESSAGE);
          setRoomUrl(null);
        },
      }
    );
  }, [schoolPublicId, createCall]);

  useEffect(() => {
    if (roomFromQuery && !roomUrl && !isPending && !callError && schoolPublicId) {
      createCall(
        { schoolPublicId, room: roomFromQuery.trim() },
        {
          onSuccess: (url) => {
            setRoomUrl(url);
          },
          onError: () => {
            setCallError(ROOM_NOT_CREATED_MESSAGE);
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

  const handleFormSubmit = (e: FormEvent) => {
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

      {!isPending && !callError && !jitsiConfig && (
        <Paper component="form" onSubmit={handleFormSubmit} sx={styles.formCard}>
          <Typography variant="h6" sx={styles.formTitle}>
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
            placeholder="Например: Математика-101"
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

      {!isPending && jitsiConfig && (
        <Box sx={styles.callLayout}>
          <Box sx={styles.callHeaderBar}>
            <Typography variant="subtitle1" sx={styles.callTitle}>
              Комната: {activeRoom || jitsiConfig.roomName}
            </Typography>
            <Box sx={styles.callActions}>
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
