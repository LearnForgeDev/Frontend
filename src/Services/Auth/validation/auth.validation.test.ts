import { describe, expect, it } from 'vitest';
import { validateAuthForm } from './auth.validation';
import { AUTH_VALIDATION_MESSAGES } from '../hooks/useAuthForm/useAuthForm.const';

const form = { name: 'Ученик', password: 'Password1234', confirmPassword: 'Password1234' };

describe('Registration password policy', () => {
  it.each(['Password12', 'abcdefghijkl', '123456789012', '!!!!!!!!!!!!', 'password²!!!', '𐐀1234567890'])(
    'rejects a new password that violates the policy: %s',
    (password) => {
      expect(validateAuthForm('register', { ...form, password, confirmPassword: password }))
        .toBe(AUTH_VALIDATION_MESSAGES.passwordRequirements);
    },
  );

  it.each(['Password1234', 'ДлинныйПароль1', 'парольпароль١', ' Password12 ', '𐐀12345678901', 'abcdefghijk𝟙', 'abcd\nefghij1'])(
    'accepts twelve or more unchanged Unicode code points with a letter and decimal digit: %s',
    (password) => expect(validateAuthForm('register', { ...form, password, confirmPassword: password })).toBeNull(),
  );

  it('keeps login compatible with a legacy short password', () => {
    expect(validateAuthForm('login', { ...form, password: 'old' })).toBeNull();
  });

  it('requires a name, a password, confirmation and a matching confirmation', () => {
    expect(validateAuthForm('register', { ...form, name: ' ' })).toBe(AUTH_VALIDATION_MESSAGES.name);
    expect(validateAuthForm('register', { ...form, password: '' })).toBe(AUTH_VALIDATION_MESSAGES.password);
    expect(validateAuthForm('register', { ...form, confirmPassword: '' })).toBe(AUTH_VALIDATION_MESSAGES.confirmation);
    expect(validateAuthForm('register', { ...form, confirmPassword: 'Different1234' })).toBe(AUTH_VALIDATION_MESSAGES.mismatch);
  });
});
