import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invitesEndpoints } from '@/Endpoints/invites/invites.endpoints';
import type { UpdateInvite } from '@/Endpoints/invites/types';
import { useToast } from '@/Storage/useToastStore';
import { INVITES_QUERY_KEY } from '../Components/InviteWidget.const';
import { useCopyInvite } from './useCopyInvite';

export function useInviteManagement(schoolPublicId: string) {
  const client = useQueryClient();
  const toast = useToast();
  const queryKey = [INVITES_QUERY_KEY, schoolPublicId];
  const refresh = () => client.invalidateQueries({ queryKey });
  const invites = useQuery({ queryKey, queryFn: () => invitesEndpoints.list(schoolPublicId) });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateInvite }) => invitesEndpoints.update(schoolPublicId, id, input),
    onSuccess: async () => { await refresh(); toast.success('Приглашение сохранено'); },
    onError: () => toast.error('Не удалось сохранить приглашение. Проверьте срок и лимит.'),
  });
  const revoke = useMutation({
    mutationFn: (id: number) => invitesEndpoints.revoke(schoolPublicId, id),
    onSuccess: refresh,
    onError: () => toast.error('Не удалось удалить приглашение'),
  });
  const rotate = useMutation({
    mutationFn: (id: number) => invitesEndpoints.rotate(schoolPublicId, id),
    onSuccess: refresh,
    onError: () => toast.error('Не удалось заменить ссылку'),
  });
  const copy = useCopyInvite();
  return { invites, update, revoke, rotate, copy };
}
