import { useMutation } from '@tanstack/react-query';
import { authEndpoints } from '@/Endpoints';
import type { InviteParams } from '@/Endpoints/auth/types';

function readInviteToken(response: unknown): string {
  if (typeof response === 'string') {
    return response;
  }

  if (response && typeof response === 'object') {
    const record = response as Record<string, unknown>;
    const token = record.inviteToken ?? record.token;
    if (typeof token === 'string') {
      return token;
    }
  }

  throw new Error('Invite token is missing');
}

export function useCreateInvite() {
  return useMutation<string, Error, InviteParams>({
    mutationFn: async (input) => readInviteToken(await authEndpoints.invite(input)),
  });
}
