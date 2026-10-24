import { Box, Typography } from '@mui/material';
import { Navigate, useSearchParams } from 'react-router-dom';
import OnboardingFrame from './components/OnboardingFrame/OnboardingFrame';
import SchoolSetup from './components/SchoolSetup/SchoolSetup';
import { useOnboardingEntry } from './hooks/useOnboardingEntry';
import * as S from './OnboardingPage.styles';

export default function OnboardingPage() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite') ?? '';
  const { pointer } = useOnboardingEntry();

  if (pointer && !inviteToken) {
    return (
      <Navigate
        to={`/onboarding/waiting/${pointer.requestPublicId}`}
        replace
      />
    );
  }

  return (
    <OnboardingFrame stage="selection">
      <Box sx={S.content}>
        <Box component="header" sx={S.header}>
          <Typography component="h1" variant="h3" sx={S.title}>
            Подключитесь к школе
          </Typography>
          <Typography component="p" sx={S.subtitle}>
            Вступите по приглашению или создайте свою.
          </Typography>
        </Box>

        <SchoolSetup inviteToken={inviteToken} />
      </Box>
    </OnboardingFrame>
  );
}
