import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesEndpoints } from '@/Endpoints';
import type { Branch } from '@/Endpoints/branches/branches.contract.type';
import type { ChatThread } from '@/Services/Chat/Chat.type';
import { useDirectChatContacts } from '@/Services/Chat/hooks/useDirectChatContacts';

export function useChats(schoolPublicId: string) {
  if (!schoolPublicId) {
    throw new Error('schoolPublicId is missing');
  }

  const queryClient = useQueryClient();
  const direct = useDirectChatContacts(schoolPublicId);

  const { data: branches = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['chats-branches', schoolPublicId],
    queryFn: () => branchesEndpoints.getBranches(schoolPublicId),
    enabled: !!schoolPublicId,
    staleTime: 30 * 1000,
  });

  const branchThreads: ChatThread[] = branches.map((b: Branch) => ({
    id: b.publicId,
    type: 'branch',
    name: b.name,
    schoolPublicId,
  }));

  const createBranchMutation = useMutation({
    mutationFn: (dto: { name: string; description: string }) =>
      branchesEndpoints.createBranch(schoolPublicId, {
        name: dto.name,
        description: dto.description,
        schoolPublicId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['chats-branches', schoolPublicId] });
      await queryClient.refetchQueries({ queryKey: ['chats-branches', schoolPublicId] });
    },
  });

  return {
    branchThreads,
    direct,
    isLoading,
    isError,
    refetch,
    createBranch: createBranchMutation.mutateAsync,
    isCreatingBranch: createBranchMutation.isPending,
  };
}
