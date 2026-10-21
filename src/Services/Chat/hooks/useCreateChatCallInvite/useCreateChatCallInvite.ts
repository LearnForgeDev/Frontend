import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/Storage/useToastStore';
import type { ChatThread } from '@/Services/Chat/Chat.types';
import { useCreateCall } from '@/Services/Schools/CallsPage/hooks/useCreateCall';
import {
  CHAT_CALL_CREATE_ERROR_SUBTITLE,
  CHAT_CALL_CREATE_ERROR_TITLE,
} from './useCreateChatCallInvite.const';
import {
  createChatCallInviteMessage,
  createChatCallInviteUrl,
  createChatCallRoomName,
  createChatCallTitle,
} from './useCreateChatCallInvite.utils';

interface UseCreateChatCallInviteParams {
  thread: ChatThread | null;
  sendMessage: (text: string, filePublicIds?: string[]) => Promise<void>;
}

export function useCreateChatCallInvite({ thread, sendMessage }: UseCreateChatCallInviteParams) {
  const createCall = useCreateCall({
    errorTitle: CHAT_CALL_CREATE_ERROR_TITLE,
    errorSubtitle: CHAT_CALL_CREATE_ERROR_SUBTITLE,
  });

  const toast = useToast();
  const invite = useMutation({ networkMode: 'always', mutationFn: async () => {
    if (!thread) return;

    const room = createChatCallRoomName(thread);
    const title = createChatCallTitle(thread.name);
    const inviteUrl = createChatCallInviteUrl(thread.schoolPublicId, room, title);

    await createCall.mutateAsync({ schoolPublicId: thread.schoolPublicId, room });
    await sendMessage(createChatCallInviteMessage(title, inviteUrl));
  }, onError: () => toast.error(CHAT_CALL_CREATE_ERROR_SUBTITLE) });

  return {
    createCallInvite: () => invite.mutate(),
    isPending: invite.isPending,
  };
}
