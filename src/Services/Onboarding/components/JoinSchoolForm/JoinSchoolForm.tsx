import type { JoinSchoolFormProps } from './JoinSchoolForm.type';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useInviteEntry } from '../../hooks/useInviteEntry';
import * as S from './JoinSchoolForm.styles';

export default function JoinSchoolForm({ allowInviteLink = false }: JoinSchoolFormProps) {
  const { inviteLink, changeInviteLink, submit, validationError } = useInviteEntry();

  if (!allowInviteLink) {
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
      <Typography sx={S.helperText}>
        Вставьте ссылку от преподавателя или владельца школы.
      </Typography>
      <TextField
        fullWidth
        label="Ссылка-приглашение"
        type="url"
        value={inviteLink}
        onChange={(event) => changeInviteLink(event.target.value)}
        error={Boolean(validationError)}
        helperText={validationError}
        autoComplete="off"
        slotProps={{ htmlInput: { 'data-testid': 'onboarding-invite-link' } }}
        sx={S.input}
        margin="normal"
      />
      <Button
        data-testid="onboarding-invite-submit"
        type="submit"
        variant="contained"
        fullWidth
        sx={S.submitButton}
      >
        Продолжить
      </Button>
    </Box>
  );
}
