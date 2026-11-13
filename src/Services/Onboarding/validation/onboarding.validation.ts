import type { ValidationResult } from './onboarding.validation.type';
export type { ValidationResult } from './onboarding.validation.type';

export function validateSchoolName(schoolName: string): ValidationResult {
  const value = schoolName.trim();

  return value.length > 0
    ? { value, error: null }
    : { value, error: 'Введите название школы' };
}
