import type { UseRequestedDirectChatOptions } from './useRequestedDirectChat.type';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useRequestedDirectChat({
  members,
  directThreads,
  addDirectChat,
  onOpenThread,
}: UseRequestedDirectChatOptions) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedUserPublicId = searchParams.get('user');

  useEffect(() => {
    if (!requestedUserPublicId) {
      return;
    }

    const existingThread = directThreads.find((thread) => thread.id === requestedUserPublicId);
    const member = members.find((item) => item.userPublicId === requestedUserPublicId);
    if (!existingThread && !member) {
      return;
    }

    onOpenThread(
      existingThread ?? addDirectChat(member!.displayName, member!.userPublicId),
    );
    setSearchParams({}, { replace: true });
  }, [
    addDirectChat,
    directThreads,
    members,
    onOpenThread,
    requestedUserPublicId,
    setSearchParams,
  ]);
}
