import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { MemberDto } from '@/Endpoints/schools/types';
import type { ChatThread } from '@/Services/Chat/Chat.types';

type UseRequestedDirectChatOptions = {
  members: MemberDto[];
  directThreads: ChatThread[];
  addDirectChat: (name: string, otherUserId: string) => ChatThread;
  onOpenThread: (thread: ChatThread) => void;
};

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
