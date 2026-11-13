import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';
import { getAuthPath } from '@/Services/Auth/Pages/AuthLayout/AuthLayout.utils';
import { useUser } from '@/Services/Auth/hooks/useUser';
import { useLogout } from '@/Services/Auth/hooks/useLogout/useLogout';
import SessionRestoreError from '@/Services/Auth/Components/SessionRestoreError/SessionRestoreError';

export default function ProtectedRoute() {
  const isAuthenticated = useGlobalContext((s) => s.auth.isAuthenticated);
  const location = useLocation();
  const { isRestoring, isRestoreError, retryRestore } = useUser();
  const logout = useLogout();

  if (isRestoring || isRestoreError) {
    return <SessionRestoreError isPending={isRestoring} onRetry={retryRestore} onLogout={logout} />;
  }

  if (!isAuthenticated) {
    return <Navigate to={getAuthPath('login', `${location.pathname}${location.search}${location.hash}`)} replace />;
  }

  return <Outlet />;
}
