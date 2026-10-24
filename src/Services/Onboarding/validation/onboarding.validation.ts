export type ValidationResult = {
  value: string;
  error: string | null;
};

export function validateSchoolName(schoolName: string): ValidationResult {
  const value = schoolName.trim();

  return value.length > 0
    ? { value, error: null }
    : { value, error: 'Введите название школы' };
}
