import { Navigate, useLocation } from 'react-router-dom';

export default function AuthEntryRedirect() {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: '/auth/login', search, hash }} replace />;
}
