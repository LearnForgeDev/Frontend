import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesEndpoints } from '@/Endpoints/branches.endpoints';
import type { ChatThread } from '@/Services/Chat/Chat.types';

export function useChats(schoolId: number, schoolPublicId: string) {
  const queryClient = useQueryClient();

  // Local storage based direct threads
  const [directThreads, setDirectThreads] = useState<ChatThread[]>([]);

  useEffect(() => {
    if (!schoolPublicId) return;
    try {
      const key = `direct_threads_${schoolPublicId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setDirectThreads(JSON.parse(saved));
      } else {
        // Default mocks
        const defaults: ChatThread[] = [
          {
            id: 'd3b07384-d113-49c3-a5af-232d1f3b8a12',
            type: 'direct',
            name: 'Алексей Петров (Преподаватель)',
            schoolPublicId,
          },
          {
            id: 'e4c18495-e224-4ad4-b6bf-343e2f4c9b23',
            type: 'direct',
            name: 'Мария Сидорова (Ассистент)',
            schoolPublicId,
          },
        ];
        localStorage.setItem(key, JSON.stringify(defaults));
        setDirectThreads(defaults);
      }
    } catch (e) {
      console.error('Failed to load direct threads', e);
    }
  }, [schoolPublicId]);

  // Fetch branches (group chats)
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

  // Create branch mutation
  const createBranchMutation = useMutation({
    mutationFn: (dto: { name: string; description: string }) =>
      branchesEndpoints.createBranch(schoolId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats-branches', schoolId] });
    },
  });

  // Create direct chat helper
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
