import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { authEndpoints } from '@/Endpoints/auth.endpoints';
import { schoolsEndpoints } from '@/Endpoints/schools.endpoints';
import { useGlobalContext } from '@/Storage/Context/useGlobalContext';
import { useUser } from '@/Storage/Context/UserContext';
import type { AppError } from '@/Endpoints/factory';

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();

  return useMutation({
    mutationFn: async (dto: { name: string; password: string }) => {
      const response = await authEndpoints.login(dto);
      useGlobalContext.getState().auth.setUser(response);
      setUser(response);
      await schoolsEndpoints.getMySchools();
      return response;
    },
    onSuccess: () => {
      const from = location.state?.from?.pathname || '/app/lessons';
      navigate(from, { replace: true });
    },
    onError: (error: AppError) => {
      return error;
    }
  });
}
