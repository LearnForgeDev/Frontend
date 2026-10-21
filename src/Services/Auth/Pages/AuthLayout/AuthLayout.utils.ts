import { AUTH_DEFAULT_PATH, AUTH_INTERNAL_PATHS, AUTH_RETURN_PARAM, AUTH_URL_BASE } from './AuthLayout.const';

export function getRedirectPath({ fromLocation }: { fromLocation?: string | null }): string {
  if (!fromLocation?.startsWith('/') || fromLocation.startsWith('//') || fromLocation.includes('\\')) {
    return AUTH_DEFAULT_PATH;
  }

  try {
    const target = new URL(fromLocation, AUTH_URL_BASE);
    const isInternal = target.origin === AUTH_URL_BASE && AUTH_INTERNAL_PATHS.some(
      (path) => target.pathname === path || target.pathname.startsWith(`${path}/`),
    );
    return isInternal ? `${target.pathname}${target.search}${target.hash}` : AUTH_DEFAULT_PATH;
  } catch {
    return AUTH_DEFAULT_PATH;
  }
}

export function getAuthPath(mode: 'login' | 'register', fromLocation?: string | null): string {
  const target = getRedirectPath({ fromLocation });
  const search = target === AUTH_DEFAULT_PATH ? '' : `?${new URLSearchParams({ [AUTH_RETURN_PARAM]: target })}`;
  return `/auth/${mode}${search}`;
}
