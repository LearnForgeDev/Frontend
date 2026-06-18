import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesEndpoints } from '@/Endpoints/branches.endpoints';
import type { ChatThread } from '@/Services/Chat/Chat.types';

export function useChats(schoolId: number, schoolPublicId: string) {
  if (!schoolPublicId) {
    throw new Error('schoolPublicId is missing');
  }

  const queryClient = useQueryClient();
  const [directThreads, setDirectThreads] = useState<ChatThread[]>([]);

  useEffect(() => {
    try {
      const key = `direct_threads_${schoolPublicId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setDirectThreads(JSON.parse(saved));
      } else {
        setDirectThreads([]);
      }
    } catch (e) {
      console.error('Failed to load direct threads', e);
    }
  }, [schoolPublicId]);

  const { data: branches = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['chats-branches', schoolId],
    queryFn: () => branchesEndpoints.getAllBranches(schoolId),
    enabled: !!schoolId,
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
      branchesEndpoints.createBranch(schoolId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats-branches', schoolId] });
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
