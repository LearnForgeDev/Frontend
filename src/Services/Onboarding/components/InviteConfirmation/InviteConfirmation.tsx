import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAcceptInvite } from '../../hooks/useAcceptInvite';
import { useInvitePreview } from '../../hooks/useInvitePreview';
import OnboardingFrame from '../OnboardingFrame/OnboardingFrame';

export default function InviteConfirmation({ inviteToken }: { inviteToken: string }) {
  const preview = useInvitePreview(inviteToken);
  const join = useAcceptInvite(inviteToken, preview.data?.schoolPublicId ?? '');

  return (
    <OnboardingFrame stage="selection">
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 480, p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={2}>
          <Typography component="h1" variant="h4">
            {preview.data?.schoolName ?? 'Приглашение в школу'}
          </Typography>
          {preview.isPending && <Typography role="status">Проверяем приглашение…</Typography>}
          {preview.isError && (
            <Alert
              severity="error"
              action={preview.unavailable ? undefined : <Button color="inherit" onClick={() => void preview.refetch()}>Повторить</Button>}
            >
              {preview.unavailable
                ? 'Приглашение недействительно. Попросите новую ссылку у преподавателя или владельца школы.'
                : 'Не удалось проверить приглашение.'}
            </Alert>
          )}
          {preview.isSuccess && (
            <Stack component="form" spacing={2} onSubmit={join.submit}>
              <Typography color="text.secondary">Подтвердите вступление в эту школу.</Typography>
              {join.isError && <Alert severity="error">Не удалось вступить. Проверьте, действует ли приглашение, или выберите другую ссылку.</Alert>}
              <Button data-testid="onboarding-join-submit" type="submit" variant="contained" disabled={join.isPending}>
                {join.isPending ? 'Присоединяем…' : 'Вступить в школу'}
              </Button>
            </Stack>
          )}
          <Button component={Link} to="/onboarding">Назад к подключению</Button>
        </Stack>
      </Paper>
    </OnboardingFrame>
  );
}
