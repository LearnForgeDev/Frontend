export function getInviteReturnPath(state: unknown): string {
  if (!state || typeof state !== 'object' || !('from' in state)) return '/app';
  const from = state.from;
  if (!from || typeof from !== 'object' || !('pathname' in from) || from.pathname !== '/onboarding' ||
    !('search' in from) || typeof from.search !== 'string') return '/app';
  const invite = new URLSearchParams(from.search).get('invite');
  return invite ? `/onboarding?invite=${encodeURIComponent(invite)}` : '/app';
}
