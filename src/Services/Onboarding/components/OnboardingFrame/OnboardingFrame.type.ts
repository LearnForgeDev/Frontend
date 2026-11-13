import type { ReactNode } from 'react';
import type { ONBOARDING_CURRENT_STEP } from './OnboardingFrame.const';

export type OnboardingFrameProps = {
  children: ReactNode;
  stage: keyof typeof ONBOARDING_CURRENT_STEP;
};
