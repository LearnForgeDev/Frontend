import { useState, type FormEvent } from 'react';
import type { SchoolInvite, UpdateInvite } from '@/Endpoints/invites/types';
import { useToast } from '@/Storage/useToastStore';
import { toLocalDateTime } from '../Components/InviteWidget.utils';
import { validateInviteUpdate } from '../validation/invites.validation';

export function useInviteEditor(invite: SchoolInvite, save: (input: UpdateInvite) => void) {
  const [maxUses, setMaxUses] = useState(invite.maxUses);
  const [expiresAt, setExpiresAt] = useState(toLocalDateTime(invite.expiresAt));
  const toast = useToast();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const input = validateInviteUpdate(maxUses, expiresAt, invite.usedCount);
    if (!input) { toast.error('Укажите допустимый лимит и срок до 7 дней'); return; }
    save(input);
  };
  return { maxUses, setMaxUses, expiresAt, setExpiresAt, submit };
}
