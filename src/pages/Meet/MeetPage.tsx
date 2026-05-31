import { useMemo, useRef } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import type { IJitsiMeetExternalApi } from '@jitsi/react-sdk/lib/types';
import { Box } from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';

import config from '../../config.ts';
import { useUser } from '../../contexts/UserContext.tsx';
import * as S from './MeetPage.styles.ts';

export default function MeetPage() {
  const apiRef = useRef<IJitsiMeetExternalApi | null>(null);
  const { user } = useUser();
  const { meetId } = useParams<{ meetId: string }>();
  const [searchParams] = useSearchParams();

  const rawRoom = searchParams.get('room') ?? meetId ?? 'MyTestRoom';
  const room = rawRoom.trim() || 'MyTestRoom';
  const permissions = useMemo(
    () => ({
      moderator: true,
      canCreateRoom: true,
      canManageRoom: true,
      canMuteParticipants: true,
      canDisableParticipantVideo: true,
      canKickParticipants: true,
      canApproveScreenSharing: true,
      canShareScreen: true,
      canRequestScreenShare: true,
    }),
    [],
  );

  const canShareScreen = Boolean(permissions.canShareScreen);

  const jitsiDomain = useMemo(() => {
    try {
      return new URL(config.jitsiBaseUrl).host;
    } catch {
      return 'meet.jit.si';
    }
  }, []);

  const toolbarButtons = useMemo(
    () =>
      canShareScreen
        ? ['microphone', 'camera', 'desktop', 'chat', 'participants-pane', 'tileview', 'settings', 'hangup']
        : ['microphone', 'camera', 'chat', 'participants-pane', 'tileview', 'settings', 'hangup'],
    [canShareScreen],
  );

  return (
      <Box sx={S.meetingFrameSx}>
        <JitsiMeeting
          domain={jitsiDomain}
          roomName={room}
          // jwt={meet.token}
          userInfo={{
            displayName: user?.userName ?? 'LearnForge User',
            email: '',
          }}
          configOverwrite={{
            startWithAudioMuted: true,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            toolbarButtons,
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            DISABLE_PREJOIN_PAGE: true,
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
  );
}