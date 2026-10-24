export const ONBOARDING_STEPS = [
  { id: 'account', label: 'Аккаунт' },
  { id: 'school', label: 'Школа' },
  { id: 'access', label: 'Доступ' },
] as const;

export const ONBOARDING_CURRENT_STEP = {
  selection: 'school',
  pending: 'access',
  rejected: 'school',
  provisioning: 'access',
  approved: 'completed',
} as const satisfies Record<string, (typeof ONBOARDING_STEPS)[number]['id'] | 'completed'>;
