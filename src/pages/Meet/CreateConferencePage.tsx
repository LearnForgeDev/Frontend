import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Alert, Box, Button, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { useNavigate } from 'react-router-dom';

import { useUser } from '../../contexts/UserContext.tsx';
import * as S from './CreateConferencePage.styles.ts';

type ConferenceFormState = {
  room: string;
  schoolPublicId: string;
};

export default function CreateConferencePage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [formState, setFormState] = useState<ConferenceFormState>({
    room: '',
    schoolPublicId: '',
  });
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return Boolean(formState.room.trim() && formState.schoolPublicId.trim());
  }, [formState.room, formState.schoolPublicId]);

  const handleChange = (field: keyof ConferenceFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const room = formState.room.trim();
    const schoolPublicId = formState.schoolPublicId.trim();

    if (!user?.jwtToken) {
      setError('Нужно войти в аккаунт');
      return;
    }

    if (!room || !schoolPublicId) {
      setError('Заполните все обязательные поля');
      return;
    }

    setError(null);
    const meetPath = encodeURIComponent(room);
    const searchParams = new URLSearchParams({ schoolPublicId }).toString();
    navigate(`/Meet/${meetPath}?${searchParams}`);
  };

  return (
    <Box sx={S.pageSx}>
      <Paper sx={S.formPaperSx} elevation={2}>
        <Typography variant="h4" component="h1" sx={S.titleSx}>
          Создать конференцию
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={S.descriptionSx}>
          Укажите комнату и schoolPublicId, чтобы запустить встречу в Jitsi.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={S.formGridSx}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Комната"
                value={formState.room}
                onChange={handleChange('room')}
                fullWidth
                required
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="School public id"
                value={formState.schoolPublicId}
                onChange={handleChange('schoolPublicId')}
                fullWidth
                required
                autoComplete="off"
              />
            </Grid>
          </Grid>

          <Stack direction="row" sx={S.actionsSx}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<VideoCallIcon />}
              disabled={!canSubmit}
            >
              Создать и перейти
            </Button>
          </Stack>

          {error && (
            <Alert severity="error" sx={S.alertSx}>
              {error}
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
}


