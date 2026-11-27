import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { authEndpoints } from '@/Endpoints/auth/auth.endpoints';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';

export function useInvitePreview(inviteToken: string) {
  const userPublicId = useGlobalContext(state => state.auth.user?.userPublicId);
  const query = useQuery({
    queryKey: ['invite-preview', userPublicId, inviteToken],
    queryFn: () => authEndpoints.previewInvite({ inviteToken }),
    retry: false,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
  const unavailable = isAxiosError(query.error) && query.error.response?.status === 404;
  return { ...query, unavailable };
}
