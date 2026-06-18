import { useQuery } from '@tanstack/react-query';
import { chatEndpoints } from '@/Endpoints/chat.endpoints';
import type { ChatThread } from '@/Services/Chat/Chat.types';

export function useChatList(schoolId: number, schoolPublicId: string) {
  const { data: branches, isLoading, isError } = useQuery({
    queryKey: ['chat-branches', schoolId],
    queryFn: () => chatEndpoints.listBranches(schoolId),
    staleTime: 2 * 60 * 1000,
    enabled: !!schoolId && !!schoolPublicId,
  });

  const branchThreads: ChatThread[] = branches?.map((branch) => ({
    id: branch.id.toString(),
    type: 'branch',
    name: branch.name,
    schoolPublicId,
  })) || [];

  // Currently there is no endpoint to list users for direct chats.
  // ACTION REQUIRED BY BACKEND:
  // Build an endpoint like GET /api/ApiSchool/{schoolId}/users
  // that returns an array of available contacts.
  // Once built, fetch them here and map to ChatThread[] with type: 'direct'.
  const directThreads: ChatThread[] = [];

  const threads = [...branchThreads, ...directThreads];

  return { threads, isLoading, isError };
}
