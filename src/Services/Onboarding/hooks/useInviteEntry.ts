import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateInviteLink } from '../validation/inviteLink.validation';

export function useInviteEntry() {
  const navigate = useNavigate();
  const [inviteLink, setInviteLink] = useState('');
  const [showValidationError, setShowValidationError] = useState(false);
  const validation = validateInviteLink(inviteLink);

  const changeInviteLink = (value: string) => {
    setInviteLink(value);
    setShowValidationError(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validation.error) {
      setShowValidationError(true);
      return;
    }

    navigate(`/onboarding?invite=${encodeURIComponent(validation.value)}`);
  };

  return { inviteLink, changeInviteLink, submit, validationError: showValidationError ? validation.error : null };
}
