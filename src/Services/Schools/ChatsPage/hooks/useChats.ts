import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesEndpoints } from '@/Endpoints';
import type { ChatThread } from '@/Services/Chat/Chat.types';

export function useChats(schoolPublicId: string) {
  if (!schoolPublicId) {
    throw new Error('schoolPublicId is missing');
  }

  const queryClient = useQueryClient();
  const [directThreads, setDirectThreads] = useState<ChatThread[]>(() => {
    try {
      const key = `direct_threads_${schoolPublicId}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load direct threads', e);
      return [];
    }
  });

  const { data: branches = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['chats-branches', schoolPublicId],
    queryFn: () => branchesEndpoints.getBranches(schoolPublicId),
    enabled: !!schoolPublicId,
    staleTime: 30 * 1000,
  });

  const branchThreads: ChatThread[] = branches.map((b) => ({
    id: b.id.toString(),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats-branches', schoolPublicId] });
    },
  });

  const addDirectChat = (name: string, otherUserId: string) => {
    const newThread: ChatThread = {
      id: otherUserId,
      type: 'direct',
      name,
      schoolPublicId,
    };
    const updated = [...directThreads, newThread];
    setDirectThreads(updated);
    try {
      localStorage.setItem(`direct_threads_${schoolPublicId}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save direct thread', e);
    }
    return newThread;
  };

  return {
    branchThreads,
    directThreads,
    isLoading,
    isError,
    refetch,
    createBranch: createBranchMutation.mutateAsync,
    isCreatingBranch: createBranchMutation.isPending,
    addDirectChat,
  };
}
