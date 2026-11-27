import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { schoolsEndpoints } from '@/Endpoints';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import type { ChatThread } from '../Chat.type';

export function useDirectChatContacts(schoolPublicId: string) {
  const userPublicId = useGlobalContext(state => state.auth.user?.userPublicId);
  const query = useQuery({
    queryKey: ['school-members', schoolPublicId, userPublicId],
    queryFn: () => schoolsEndpoints.listMembers(schoolPublicId),
    enabled: Boolean(schoolPublicId && userPublicId),
    staleTime: 60_000,
  });
  const members = useMemo(() => query.data?.filter(member => member.userPublicId !== userPublicId) ?? [], [query.data, userPublicId]);
  const threads = useMemo<ChatThread[]>(() => members.map(member => ({
    id: member.userPublicId,
    type: 'direct',
    name: member.displayName,
    schoolPublicId,
  })), [members, schoolPublicId]);
  return { ...query, members, threads };
}
