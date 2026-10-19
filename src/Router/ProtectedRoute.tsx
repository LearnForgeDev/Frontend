import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';

export default function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = useGlobalContext((s) => s.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: { pathname: location.pathname, search: location.search } }} replace />;
  }

  return <Outlet />;
}
