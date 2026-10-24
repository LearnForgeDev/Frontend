import { useReducer, type FormEvent } from 'react';
import { AuthRole } from '@/Assets/Types/commonTypes';
import { useCreateInvite } from './useCreateInvite';
import { useCopyInvite } from './useCopyInvite';
import { DEFAULT_INVITE_MAX_USES, DEFAULT_INVITE_EXPIRATION_HOURS, MINUTES_IN_HOUR } from '../Components/InviteWidget.const';
import { getInviteUrl } from '../Components/InviteWidget.utils';

type Fields = { role: AuthRole; maxUses: number; expirationHours: number };

export function useInviteCreationForm(schoolPublicId: string) {
  const createInvite = useCreateInvite();
  const copy = useCopyInvite();
  const [fields, change] = useReducer((state: Fields, patch: Partial<Fields>) => ({ ...state, ...patch }), {
    role: AuthRole.STUDENT, maxUses: DEFAULT_INVITE_MAX_USES, expirationHours: DEFAULT_INVITE_EXPIRATION_HOURS,
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    createInvite.mutate({ schoolPublicId, role: fields.role, maxUses: fields.maxUses, expiresInMinutes: fields.expirationHours * MINUTES_IN_HOUR });
  };
  return { fields, change, submit, createInvite, copy, inviteUrl: createInvite.data ? getInviteUrl(createInvite.data) : '' };
}
