import type { ValidationResult } from './onboarding.validation';

export function validateInviteLink(value: string): ValidationResult {
  let link: URL | null;

  try {
    link = new URL(value.trim());
  } catch {
    link = null;
  }

  const token = link?.searchParams.get('invite')?.trim();

  if (link && (link.protocol === 'https:' || link.protocol === 'http:') && link.pathname === '/onboarding' && token) {
    return { value: token, error: null };
  }

  return { value: '', error: 'Вставьте полную ссылку-приглашение в LearnForge.' };
}
