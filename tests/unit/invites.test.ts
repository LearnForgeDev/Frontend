import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRedirectPath } from '../../src/Services/Auth/Pages/AuthLayout/AuthLayout.utils';
import { validateInviteUpdate } from '../../src/Services/Schools/StudentsPage/validation/invites.validation';

afterEach(() => vi.useRealTimers());

describe('Возврат к приглашению', () => {
  it('сохраняет токен, включая специальные символы', () => {
    const token = 'abc+/=';
    expect(getRedirectPath({ fromLocation: `/onboarding?invite=${encodeURIComponent(token)}` }))
      .toBe(`/onboarding?invite=${encodeURIComponent(token)}`);
  });
  it.each([null, '', '//example.com', 'https://example.com/onboarding?invite=abc'])('отклоняет произвольный адрес %j', (fromLocation) => {
    expect(getRedirectPath({ fromLocation })).toBe('/app');
  });
});

describe('Изменение приглашения', () => {
  it('не допускает уменьшение лимита ниже числа вступивших, дробные лимиты и срок вне диапазона', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-19T12:00:00Z'));
    expect(validateInviteUpdate(2, '2026-10-20T12:00:00Z', 3)).toBeNull();
    expect(validateInviteUpdate(3.5, '2026-10-20T12:00:00Z', 3)).toBeNull();
    expect(validateInviteUpdate(101, '2026-10-20T12:00:00Z', 3)).toBeNull();
    expect(validateInviteUpdate(4, '2026-10-19T12:00:00Z', 3)).toBeNull();
    expect(validateInviteUpdate(4, '2026-10-27T12:00:00Z', 3)).toBeNull();
    expect(validateInviteUpdate(4, 'invalid', 3)).toBeNull();
    expect(validateInviteUpdate(4, '2026-10-20T12:00:00Z', 3)).toEqual({ maxUses: 4, expiresAt: '2026-10-20T12:00:00.000Z' });
  });
});
