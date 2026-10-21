import type { AuthFormState, AuthMode } from '../hooks/useAuthForm/useAuthForm.types';
import { AUTH_VALIDATION_MESSAGES } from '../hooks/useAuthForm/useAuthForm.const';

export function validateAuthForm(mode: AuthMode, form: AuthFormState): string | null {
  if (!form.name.trim()) return AUTH_VALIDATION_MESSAGES.name;
  if (!form.password) return AUTH_VALIDATION_MESSAGES.password;
  if (mode === 'login') return null;
  if (!form.confirmPassword) return AUTH_VALIDATION_MESSAGES.confirmation;
  return form.password === form.confirmPassword ? null : AUTH_VALIDATION_MESSAGES.mismatch;
}
