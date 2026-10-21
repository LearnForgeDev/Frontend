import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useChatHubConnection, type ChatHubParams } from '@/Assets/Hooks/useSignalR/chatHub';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { chatEndpoints } from '@/Endpoints';
import { mapChatHistory, type ApiHistoryItem } from './useChatMessages.utils';
import { CHAT_CONNECTION_ERROR } from './useChatMessages.const';

export function useChatMessages(params: ChatHubParams) {
  const { type, schoolPublicId, threadId } = params;
  const { connection, status } = useChatHubConnection(params);
  const queryClient = useQueryClient();
  const userName = useGlobalContext(state => state.auth.user?.userName);
  const userPublicId = useGlobalContext(state => state.auth.user?.userPublicId);
  const queryKey = ['chat-messages', schoolPublicId, type, threadId, userPublicId];
  const history = useQuery({
    queryKey,
    queryFn: async () => {
      const messages: ApiHistoryItem[] = await (type === 'branch'
        ? chatEndpoints.getBranchHistory(schoolPublicId, threadId)
        : chatEndpoints.getDirectHistory(schoolPublicId, threadId));
      return mapChatHistory(messages, schoolPublicId, userPublicId, userName);
    },
    enabled: Boolean(schoolPublicId && threadId),
  });

  useEffect(() => {
    if (!connection) return;
    const refreshHistory = () => {
      void queryClient.invalidateQueries({ queryKey: ['chat-messages', schoolPublicId, type, threadId, userPublicId] });
    };
    connection.on('ReceiveMessage', refreshHistory);
    return () => connection.off('ReceiveMessage', refreshHistory);
  }, [connection, queryClient, schoolPublicId, type, threadId, userPublicId]);

  const send = useMutation({
    networkMode: 'always',
    mutationFn: async ({ text, filePublicIds }: { text: string; filePublicIds: string[] }) => {
      if (!connection || status !== 'connected') throw new Error(CHAT_CONNECTION_ERROR);
      await connection.invoke(type === 'branch' ? 'SendMessageToBreanch' : 'SendMessageToDirect', schoolPublicId, threadId, text, filePublicIds);
    },
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey }); },
  });

  return {
    messages: history.data ?? [],
    sendMessage: (text: string, filePublicIds: string[] = []) => send.mutateAsync({ text, filePublicIds }),
    status,
    isSending: send.isPending,
    isConnecting: status === 'connecting' || status === 'reconnecting',
  };
}
