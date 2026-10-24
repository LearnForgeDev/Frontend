import { useState, type FormEvent } from 'react';
import { useAcceptInvite } from './useAcceptInvite';
import { validateInviteLink } from '../validation/inviteLink.validation';

export function useInviteEntry(initialInviteToken: string, knownSchoolPublicIds: string[]) {
  const [inviteLink, setInviteLink] = useState('');
  const [showValidationError, setShowValidationError] = useState(false);
  const validation = validateInviteLink(inviteLink);
  const join = useAcceptInvite(initialInviteToken || validation.value, knownSchoolPublicIds);

  const changeInviteLink = (value: string) => {
    setInviteLink(value);
    setShowValidationError(false);
    join.reset();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!initialInviteToken && validation.error) {
      setShowValidationError(true);
      return;
    }

    join.submit(event);
  };

  return { inviteLink, changeInviteLink, submit, join, validationError: showValidationError ? validation.error : null };
}
