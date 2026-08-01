import { useQuery } from '@tanstack/react-query';
import { branchesEndpoints } from '@/Endpoints';
import type { ChatThread } from '@/Services/Chat/Chat.types';
import type { Branch } from '@/Endpoints/branches/types';

export function useChatList(schoolPublicId: string) {
  const { data: branches, isLoading, isError } = useQuery({
    queryKey: ['chat-branches', schoolPublicId],
    queryFn: () => branchesEndpoints.getBranches(schoolPublicId),
    staleTime: 2 * 60 * 1000,
    enabled: !!schoolPublicId,
  });

  const branchThreads: ChatThread[] = branches?.map((branch: Branch) => ({
    id: branch.publicId,
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
