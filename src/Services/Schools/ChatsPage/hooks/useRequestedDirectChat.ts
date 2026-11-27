import type { UseRequestedDirectChatOptions } from './useRequestedDirectChat.type';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useRequestedDirectChat({
  directThreads,
  onOpenThread,
}: UseRequestedDirectChatOptions) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedUserPublicId = searchParams.get('user');

  useEffect(() => {
    const thread = directThreads.find((item) => item.id === requestedUserPublicId);
    if (!thread) {
      return;
    }

    onOpenThread(thread);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('user');
    setSearchParams(nextParams, { replace: true });
  }, [directThreads, onOpenThread, requestedUserPublicId, searchParams, setSearchParams]);
}
