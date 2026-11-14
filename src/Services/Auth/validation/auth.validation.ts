import type { AuthFormState, AuthMode } from '../hooks/useAuthForm/useAuthForm.type';
import { AUTH_VALIDATION_MESSAGES } from '../hooks/useAuthForm/useAuthForm.const';

export function validateAuthForm(mode: AuthMode, form: AuthFormState): string | null {
  if (!form.name.trim()) {
    return AUTH_VALIDATION_MESSAGES.name;
  }
  if (!form.password) {
    return AUTH_VALIDATION_MESSAGES.password;
  }
  if (mode === 'login') {
    return null;
  }
  if (Array.from(form.password).length < 12 || !/\p{L}/u.test(form.password) || !/\p{Nd}/u.test(form.password)) {
    return AUTH_VALIDATION_MESSAGES.passwordRequirements;
  }
  if (!form.confirmPassword) {
    return AUTH_VALIDATION_MESSAGES.confirmation;
  }
  return form.password === form.confirmPassword ? null : AUTH_VALIDATION_MESSAGES.mismatch;
}
