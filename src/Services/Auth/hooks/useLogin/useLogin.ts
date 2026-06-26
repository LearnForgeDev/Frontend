import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { authEndpoints } from '@/Endpoints';
import { schoolsEndpoints } from '@/Endpoints';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';
import { useUser } from '@/Storage/UserContext/UserContext.tsx';
import type { AppError } from '@/Endpoints';

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
