import { HubConnectionBuilder } from '@microsoft/signalr';
import { useMutation, useQuery } from '@tanstack/react-query';
import { schoolsEndpoints } from '@/Endpoints';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';
import { RECONNECT_DELAYS_MS } from '@/Services/Chat/Chat.const';
import config from '../../../../../config';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
import {
  CALL_INVITE_EMPTY_SUBTITLE,
  CALL_INVITE_EMPTY_TITLE,
  CALL_INVITE_ERROR_SUBTITLE,
  CALL_INVITE_ERROR_TITLE,
  CALL_INVITE_SUCCESS_TITLE,
} from './useBroadcastCallInvite.const';
import {
  createCallInviteMessage,
  createCallInviteUrl,
  getCallInviteRecipients,
} from './useBroadcastCallInvite.utils';

const logger = createDebugger('useBroadcastCallInvite');

interface BroadcastCallInviteParams {
  room: string;
  title: string | null;
  recipientUserPublicIds: string[];
}

async function sendDirectInvite(schoolPublicId: string, recipientUserPublicId: string, message: string) {
  const connection = new HubConnectionBuilder()
    .withUrl(`${config.endpointUrl}/directChatHub?schoolPublicId=${schoolPublicId}&otherUserId=${recipientUserPublicId}`)
    .withAutomaticReconnect(RECONNECT_DELAYS_MS)
    .build();

  try {
    await connection.start();
    await connection.invoke('SendMessageToDirect', schoolPublicId, recipientUserPublicId, message, []);
  } finally {
    await connection.stop();
  }
}

export function useBroadcastCallInvite(schoolPublicId: string) {
  const currentUserPublicId = useGlobalContext((s) => s.auth.user?.userPublicId);
  const showNotification = useGlobalNotificationStore((s) => s.pushNotification);

  const { data: members = [], refetch } = useQuery({
    queryKey: ['school-members', schoolPublicId],
    queryFn: () => schoolsEndpoints.listMembers(schoolPublicId),
    enabled: !!schoolPublicId,
    staleTime: 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: async ({ room, title, recipientUserPublicIds }: BroadcastCallInviteParams) => {
      const membersResult = members.length > 0 ? members : (await refetch()).data ?? [];
      const recipients = getCallInviteRecipients(membersResult, currentUserPublicId)
        .filter((recipient) => recipientUserPublicIds.includes(recipient.userPublicId));

      if (recipients.length === 0) {
        return 0;
      }

      const inviteUrl = createCallInviteUrl(schoolPublicId, room, title);
      const inviteMessage = createCallInviteMessage(title, inviteUrl);
      const results = await Promise.allSettled(
        recipients.map((recipient) => sendDirectInvite(schoolPublicId, recipient.userPublicId, inviteMessage)),
      );
      const sentCount = results.filter((result) => result.status === 'fulfilled').length;

      if (sentCount === 0) {
        throw new Error('No invite was sent.');
      }

      results
        .filter((result) => result.status === 'rejected')
        .forEach((result) => logger.logEventForDebug(DebugSeverity.WARNING, 'Failed to send direct invite', result.reason));

      return sentCount;
    },
    onSuccess: (sentCount) => {
      if (sentCount === 0) {
        showNotification({
          id: `call-invite-empty-${Date.now()}`,
          title: CALL_INVITE_EMPTY_TITLE,
          subtitle: CALL_INVITE_EMPTY_SUBTITLE,
          priority: 'low',
          time: 3000,
        });
        return;
      }

      showNotification({
        id: `call-invite-sent-${Date.now()}`,
        title: CALL_INVITE_SUCCESS_TITLE,
        subtitle: `Ссылка отправлена в личные сообщения: ${sentCount}.`,
        priority: 'low',
        time: 3000,
      });
    },
    onError: (err) => {
      logger.logEventForDebug(DebugSeverity.DANGER, 'Failed to broadcast call invite', err);
      showNotification({
        id: `call-invite-error-${Date.now()}`,
        title: CALL_INVITE_ERROR_TITLE,
        subtitle: CALL_INVITE_ERROR_SUBTITLE,
        priority: 'high',
        time: 5000,
      });
    },
  });

  return {
    recipients: getCallInviteRecipients(members, currentUserPublicId),
    broadcastInvite: mutation.mutate,
    isPending: mutation.isPending,
    isDisabled: mutation.isPending,
  };
}
