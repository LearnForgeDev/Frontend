import { ONBOARDING_CURRENT_STEP, ONBOARDING_STEPS } from './OnboardingFrame.const';

export function getOnboardingActiveStep(stage: keyof typeof ONBOARDING_CURRENT_STEP) {
  const currentStep = ONBOARDING_CURRENT_STEP[stage];

  if (currentStep === 'completed') {
    return ONBOARDING_STEPS.length;
  }

  return ONBOARDING_STEPS.findIndex((step) => step.id === currentStep);
}
