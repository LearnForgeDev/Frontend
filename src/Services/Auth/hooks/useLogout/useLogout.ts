import { useUser } from '@/Storage/UserContext/UserContext';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';

export function logoutToLogin(clearSession = () => useGlobalContext.getState().auth.logout()) {
  clearSession();
  window.location.assign('/auth/login');
}

export function useLogout() {
  const { clearUser } = useUser();

  return () => logoutToLogin(clearUser);
}
