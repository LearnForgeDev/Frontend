import { useState, type FormEvent } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useJoinSchool } from '../../hooks/useJoinSchool';
import { validateInviteToken } from '../../validation/onboarding.validation';
import * as S from './JoinSchoolForm.styles';

type JoinSchoolFormProps = {
  knownSchoolPublicIds: string[];
  initialInviteToken?: string;
};

export default function JoinSchoolForm({
  knownSchoolPublicIds,
  initialInviteToken = '',
}: JoinSchoolFormProps) {
  const [inviteToken, setInviteToken] = useState(initialInviteToken);
  const [validationError, setValidationError] = useState<string | null>(null);
  const joinSchool = useJoinSchool();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateInviteToken(inviteToken);
    setValidationError(validation.error);

    if (validation.error) {
      return;
    }

    joinSchool.mutate({
      inviteToken: validation.value,
      knownSchoolPublicIds,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Typography sx={S.helperText}>
        Введите код, который прислал преподаватель или владелец школы.
      </Typography>
      <TextField
        fullWidth
        label="Код приглашения"
        value={inviteToken}
        onChange={(event) => {
          setInviteToken(event.target.value);
          setValidationError(null);
        }}
        error={Boolean(validationError)}
        helperText={validationError}
        disabled={joinSchool.isPending}
        autoComplete="off"
        sx={S.input}
        margin="normal"
      />
      {joinSchool.isError && (
        <Typography color="error" role="alert">
          Не удалось присоединиться к школе. Проверьте код и попробуйте снова.
        </Typography>
      )}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={joinSchool.isPending}
        sx={S.submitButton}
      >
        {joinSchool.isPending ? 'Присоединяем…' : 'Присоединиться'}
      </Button>
    </form>
  );
}
