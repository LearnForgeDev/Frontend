import { useCallback } from 'react';
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
  sendMessage: (text: string, filePublicIds?: string[]) => void;
}

export function useCreateChatCallInvite({ thread, sendMessage }: UseCreateChatCallInviteParams) {
  const createCall = useCreateCall({
    errorTitle: CHAT_CALL_CREATE_ERROR_TITLE,
    errorSubtitle: CHAT_CALL_CREATE_ERROR_SUBTITLE,
  });

  const createCallInvite = useCallback(async () => {
    if (!thread) return;

    const room = createChatCallRoomName(thread);
    const title = createChatCallTitle(thread.name);
    const inviteUrl = createChatCallInviteUrl(thread.schoolPublicId, room, title);

    await createCall.mutateAsync({ schoolPublicId: thread.schoolPublicId, room });
    sendMessage(createChatCallInviteMessage(title, inviteUrl));
  }, [createCall, sendMessage, thread]);

  return {
    createCallInvite,
    isPending: createCall.isPending,
  };
}
