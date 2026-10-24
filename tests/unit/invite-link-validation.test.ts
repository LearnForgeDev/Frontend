import { describe, expect, it } from 'vitest';
import { validateInviteLink } from '../../src/Services/Onboarding/validation/inviteLink.validation';

describe('ссылка-приглашение в школу', () => {
  it.each([
    ['https://learnforge.qzz.io/onboarding?invite=abc', 'abc'],
    ['  https://learnforge.qzz.io/onboarding?invite=hello%2Bworld%3D  ', 'hello+world='],
    ['http://localhost:5178/onboarding?source=mail&invite=abc#join', 'abc'],
  ])('извлекает токен из полной ссылки %s', (link, token) => {
    expect(validateInviteLink(link)).toEqual({ value: token, error: null });
  });

  it.each([
    '', 'abc', '/onboarding?invite=abc', 'https://learnforge.qzz.io/onboarding',
    'https://learnforge.qzz.io/onboarding?invite=%20',
    'https://learnforge.qzz.io/other?invite=abc',
    'javascript:alert(1)?invite=abc',
    'ftp://learnforge.qzz.io/onboarding?invite=abc',
  ])('не принимает невалидное приглашение %s', (link) => {
    expect(validateInviteLink(link)).toEqual({ value: '', error: expect.any(String) });
  });
});
