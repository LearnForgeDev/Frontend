import type { FormEvent } from 'react';
import { useJoinSchool } from './useJoinSchool';
import { useToast } from '@/Storage/useToastStore';

export function useAcceptInvite(inviteToken: string, schoolPublicId: string) {
  const joinSchool = useJoinSchool();
  const toast = useToast();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!inviteToken || !schoolPublicId || joinSchool.isPending) {
      return;
    }
    joinSchool.mutate({ inviteToken, schoolPublicId }, {
      onError: () => toast.error('Не удалось вступить. Ссылка могла истечь или исчерпать лимит.'),
    });
  };
  return { ...joinSchool, submit };
}
