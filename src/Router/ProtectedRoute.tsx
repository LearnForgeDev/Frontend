import { Navigate, Outlet } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/Context/useGlobalContext';

export default function ProtectedRoute() {
  const isAuthenticated = useGlobalContext((s) => s.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
