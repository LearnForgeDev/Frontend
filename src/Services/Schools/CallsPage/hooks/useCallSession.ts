import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { meetEndpoints } from '@/Endpoints';
import { ToastSeverity, useToastStore } from '@/Storage/useToastStore';
import type { JitsiApi } from '../typings';
import config from '@/config';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
import { CUSTOM_INVITE_BUTTON_ELEMENT_ID, CUSTOM_INVITE_BUTTON_ID, INVITE_BUTTON_ICON } from '../CallsPage.constants';
import { loadJitsiScript } from '../utils/loadJitsiScript';
import { useBroadcastCallInvite } from './useBroadcastCallInvite/useBroadcastCallInvite';
import { CALL_CONNECTION_ERROR, CALL_FULLSCREEN_ERROR, JITSI_CONFIG, JITSI_INTERFACE_CONFIG } from './useCallSession.const';

const logger = createDebugger('CallSession');

export function useCallSession(schoolPublicId: string) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeRoom = searchParams.get('room')?.trim() || '';
  const activeCallTitle = searchParams.get('title')?.trim() || '';
  const [attempt, setAttempt] = useState(0);
  const [clientError, setClientError] = useState<{ room: string; attempt: number } | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const addToast = useToastStore(state => state.addToast);
  const invites = useBroadcastCallInvite(schoolPublicId);
  const session = useQuery({
    queryKey: ['call-session', schoolPublicId, activeRoom, attempt],
    enabled: !!schoolPublicId && !!activeRoom,
    retry: false,
    networkMode: 'always',
    gcTime: 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async ({ signal }) => {
      try {
        const { roomUrl } = await meetEndpoints.getMeetToken({ schoolPublicId, room: activeRoom });
        if (signal.aborted) throw new Error(CALL_CONNECTION_ERROR);
        const url = new URL(roomUrl);
        const domain = config.meetServerUrl ? new URL(config.meetServerUrl).host : url.host;
        const roomName = url.pathname.substring(1);
        if (!domain || !roomName) throw new Error(CALL_CONNECTION_ERROR);
        await loadJitsiScript(domain);
        return { domain, roomName, jwt: url.searchParams.get('jwt') || undefined };
      } catch (error) {
        if (!signal.aborted) addToast(CALL_CONNECTION_ERROR, ToastSeverity.ERROR);
        throw error;
      }
    },
  });
  const domain = session.data?.domain;
  const roomName = session.data?.roomName;
  const jwt = session.data?.jwt;
  const callError = session.isError || (clientError?.room === activeRoom && clientError?.attempt === attempt)
    ? CALL_CONNECTION_ERROR : null;

  useEffect(() => {
    if (!domain || !roomName || !containerRef.current || !window.JitsiMeetExternalAPI) return;
    const container = containerRef.current;
    container.replaceChildren();
    let disposed = false;
    let api: JitsiApi | undefined;
    void Promise.resolve().then(() => {
      if (disposed || !window.JitsiMeetExternalAPI) return;
      api = new window.JitsiMeetExternalAPI(domain, {
        roomName, jwt, parentNode: container, width: '100%', height: '100%', lang: 'ru',
        configOverwrite: JITSI_CONFIG, interfaceConfigOverwrite: JITSI_INTERFACE_CONFIG,
      });
      api.addEventListener('videoConferenceJoined', () => {
        if (disposed) return;
        try {
          api?.registerCustomToolbarButton?.({
            id: CUSTOM_INVITE_BUTTON_ID, text: 'Пригласить', icon: INVITE_BUTTON_ICON, btnId: CUSTOM_INVITE_BUTTON_ELEMENT_ID,
          });
        } catch (error) {
          logger.logEventForDebug(DebugSeverity.WARNING, 'Не удалось добавить кнопку приглашения', error);
        }
      });
      api.addEventListener('customToolbarButtonClicked', event => {
        if (!disposed && event.id === CUSTOM_INVITE_BUTTON_ID) setIsInviteDialogOpen(true);
      });
      api.addEventListener('videoConferenceLeft', () => {
        if (disposed) return;
        if (document.fullscreenElement) void document.exitFullscreen().catch(() => addToast(CALL_FULLSCREEN_ERROR, ToastSeverity.ERROR));
        navigate(`/app/schools/${schoolPublicId}/today`);
      });
    }).catch(() => {
      if (disposed) return;
      api?.dispose();
      api = undefined;
      container.replaceChildren();
      addToast(CALL_CONNECTION_ERROR, ToastSeverity.ERROR);
      setClientError({ room: activeRoom, attempt });
    });
    return () => {
      disposed = true;
      api?.dispose();
      container.replaceChildren();
    };
  }, [domain, roomName, jwt, activeRoom, attempt, schoolPublicId, navigate, addToast]);

  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(document.fullscreenElement === pageRef.current);
    document.addEventListener('fullscreenchange', updateFullscreen);
    return () => document.removeEventListener('fullscreenchange', updateFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await pageRef.current?.requestFullscreen();
    } catch {
      addToast(CALL_FULLSCREEN_ERROR, ToastSeverity.ERROR);
    }
  };

  const sendInvite = (recipientUserPublicIds: string[]) => {
    if (!activeRoom) return;
    invites.broadcastInvite({ room: activeRoom, title: activeCallTitle, recipientUserPublicIds });
    setIsInviteDialogOpen(false);
  };

  return {
    containerRef, pageRef, activeRoom, activeCallTitle, isFullscreen, toggleFullscreen,
    isPending: session.isFetching, callError, isConnected: !!session.data && !callError,
    retry: () => setAttempt(value => value + 1), close: () => setSearchParams({}),
    invites, isInviteDialogOpen, openInvite: () => setIsInviteDialogOpen(true),
    closeInvite: () => setIsInviteDialogOpen(false), sendInvite,
  };
}
