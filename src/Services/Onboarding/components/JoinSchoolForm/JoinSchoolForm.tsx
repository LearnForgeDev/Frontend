import { Box, Button, TextField, Typography } from '@mui/material';
import { useInviteEntry } from '../../hooks/useInviteEntry';
import * as S from './JoinSchoolForm.styles';

type JoinSchoolFormProps = {
  knownSchoolPublicIds: string[];
  initialInviteToken?: string;
  disabled?: boolean;
  allowInviteLink?: boolean;
};

export default function JoinSchoolForm({
  knownSchoolPublicIds,
  initialInviteToken = '',
  disabled = false,
  allowInviteLink = false,
}: JoinSchoolFormProps) {
  const { inviteLink, changeInviteLink, submit, join, validationError } =
    useInviteEntry(initialInviteToken, knownSchoolPublicIds);

  if (!initialInviteToken && !allowInviteLink) {
    return (
      <Box sx={S.instructions}>
        <Typography sx={S.instructionTitle}>
          Откройте ссылку-приглашение
        </Typography>
        <Typography sx={S.instructionDescription}>
          Нет ссылки? Попросите её у преподавателя или владельца школы.
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={submit} sx={S.form} noValidate>
      <Typography sx={initialInviteToken ? S.confirmationText : S.helperText}>
        {initialInviteToken ? 'Приглашение готово. Подтвердите вступление.' : 'Вставьте ссылку от преподавателя или владельца школы.'}
      </Typography>
      {!initialInviteToken && (
        <TextField
          fullWidth
          label="Ссылка-приглашение"
          type="url"
          value={inviteLink}
          onChange={(event) => changeInviteLink(event.target.value)}
          error={Boolean(validationError)}
          helperText={validationError}
          disabled={join.isPending}
          autoComplete="off"
          sx={S.input}
          margin="normal"
        />
      )}
      {join.isError && (
        <Typography color="error" role="alert" sx={S.error}>
          Не удалось вступить. Ссылка могла истечь, быть удалена или исчерпать лимит.
        </Typography>
      )}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={disabled || join.isPending}
        sx={S.submitButton}
      >
        {join.isPending ? 'Присоединяем…' : 'Вступить в школу'}
      </Button>
    </Box>
  );
}
