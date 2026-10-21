import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';
import { getAuthPath } from '@/Services/Auth/Pages/AuthLayout/AuthLayout.utils';

export default function ProtectedRoute() {
  const isAuthenticated = useGlobalContext((s) => s.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={getAuthPath('login', `${location.pathname}${location.search}${location.hash}`)} replace />;
  }

  return <Outlet />;
}
