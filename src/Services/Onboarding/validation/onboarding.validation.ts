export type ValidationResult = {
  value: string;
  error: string | null;
};

export function validateInviteToken(inviteToken: string): ValidationResult {
  const value = inviteToken.trim();

  return value.length > 0
    ? { value, error: null }
    : { value, error: 'Введите код приглашения' };
}

export function validateSchoolName(schoolName: string): ValidationResult {
  const value = schoolName.trim();

  return value.length > 0
    ? { value, error: null }
    : { value, error: 'Введите название школы' };
}
