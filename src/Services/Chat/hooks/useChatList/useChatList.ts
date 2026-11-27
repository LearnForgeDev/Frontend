import { useQuery } from '@tanstack/react-query';
import { branchesEndpoints } from '@/Endpoints';
import type { ChatThread, ChatType } from '@/Services/Chat/Chat.type';
import type { Branch } from '@/Endpoints/branches/branches.contract.type';
import { useDirectChatContacts } from '../useDirectChatContacts';

export function useChatList(schoolPublicId: string, tab: ChatType) {
  const direct = useDirectChatContacts(schoolPublicId);
  const branches = useQuery({
    queryKey: ['chats-branches', schoolPublicId],
    queryFn: () => branchesEndpoints.getBranches(schoolPublicId),
    staleTime: 30_000,
    enabled: Boolean(schoolPublicId && tab === 'branch'),
  });

  const branchThreads: ChatThread[] = branches.data?.map((branch: Branch) => ({
    id: branch.publicId,
    type: 'branch',
    name: branch.name,
    schoolPublicId,
  })) || [];

  return tab === 'direct' ? direct : { ...branches, threads: branchThreads };
}
