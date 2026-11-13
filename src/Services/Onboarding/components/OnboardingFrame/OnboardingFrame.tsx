import type { ReactNode } from 'react';
import { Box, Button, Step, StepLabel, Stepper, Typography } from '@mui/material';
import ProfileButton from '@/Services/Profile/components/ProfileButton/ProfileButton';
import { useLogout } from '@/Services/Auth/hooks/useLogout/useLogout';
import { ONBOARDING_CURRENT_STEP, ONBOARDING_STEPS } from './OnboardingFrame.const';
import { getOnboardingActiveStep } from './OnboardingFrame.utils';
import * as S from './OnboardingFrame.styles';

type OnboardingFrameProps = {
  children: ReactNode;
  stage: keyof typeof ONBOARDING_CURRENT_STEP;
};

export default function OnboardingFrame({ children, stage }: OnboardingFrameProps) {
  const activeStep = getOnboardingActiveStep(stage);
  const logout = useLogout();

  return (
    <Box sx={S.page}>
      <Box component="header" sx={S.header}>
        <Typography sx={S.brand}>LearnForge</Typography>
        <Box>
          <ProfileButton />
          <Button data-testid="onboarding-logout" onClick={logout}>Выйти</Button>
        </Box>
      </Box>
      <Stepper activeStep={activeStep} alternativeLabel sx={S.progress} aria-label="Прогресс настройки">
        {ONBOARDING_STEPS.map(({ id, label }, index) => (
          <Step key={id}>
            <StepLabel aria-current={index === activeStep ? 'step' : undefined}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box component="main" sx={stage === 'selection' ? S.selectionContent : S.content}>{children}</Box>
    </Box>
  );
}
