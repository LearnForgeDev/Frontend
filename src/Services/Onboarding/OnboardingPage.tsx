import { Box, Paper, Typography } from '@mui/material';
import { Navigate, useSearchParams } from 'react-router-dom';
import JoinSchoolForm from './components/JoinSchoolForm/JoinSchoolForm';
import RequestSchoolForm from './components/RequestSchoolForm/RequestSchoolForm';
import { useOnboardingSchools } from './hooks/useOnboardingSchools';
import { readSchoolRequestPointer } from './utils/schoolRequestStorage.utils';
import * as S from './OnboardingPage.styles';

export default function OnboardingPage() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite') ?? '';
  const pointer = readSchoolRequestPointer();
  const schoolsQuery = useOnboardingSchools();

  if (pointer) {
    return (
      <Navigate
        to={`/onboarding/waiting/${pointer.requestPublicId}`}
        replace
      />
    );
  }

  const knownSchoolPublicIds =
    schoolsQuery.data?.map((school) => school.schoolPublicId) ?? [];

  return (
    <Box component="main" sx={S.page}>
      <Box sx={S.content}>
        <Box component="header" sx={S.header}>
          <Typography variant="overline" sx={S.eyebrow}>
            Первый шаг
          </Typography>
          <Typography component="h1" variant="h3" sx={S.title}>
            Найдите свою школу
          </Typography>
          <Typography variant="h6" sx={S.subtitle}>
            Присоединитесь по приглашению или создайте новое пространство.
          </Typography>
        </Box>

        <Box sx={S.scenarios}>
          <Paper component="section" sx={S.primaryCard}>
            <Box sx={S.cardHeader}>
              <Typography component="h2" variant="h5" sx={S.cardTitle}>
                У меня есть приглашение
              </Typography>
              <Typography color="text.secondary">
                Самый быстрый способ начать работу.
              </Typography>
            </Box>
            <JoinSchoolForm
              knownSchoolPublicIds={knownSchoolPublicIds}
              initialInviteToken={inviteToken}
            />
          </Paper>

          <Paper component="section" sx={S.secondaryCard}>
            <Box sx={S.cardHeader}>
              <Typography component="h2" variant="h5" sx={S.cardTitle}>
                Нужна новая школа
              </Typography>
              <Typography color="text.secondary">
                Пространство появится после подтверждения заявки.
              </Typography>
            </Box>
            <RequestSchoolForm />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
