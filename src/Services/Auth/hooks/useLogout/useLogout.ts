import { useNavigate } from 'react-router-dom';
import { useUser } from '@/Storage/UserContext/UserContext';

export function useLogout() {
  const navigate = useNavigate();
  const { clearUser } = useUser();

  return () => {
    clearUser();
    navigate('/auth/login', { replace: true });
  };
}
