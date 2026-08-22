import { useMutation } from '@tanstack/react-query';
import { meetEndpoints } from '@/Endpoints';
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';
import type { AppError } from '@/Endpoints';
import type { CreateJitsiTokenRequest } from '@/Endpoints';
import { ROOM_NOT_CREATED_MESSAGE } from '../CallsPage.constants';

export function useCreateCall() {
  const showNotification = useGlobalNotificationStore((s) => s.pushNotification);

  return useMutation<string, AppError, CreateJitsiTokenRequest>({
    mutationFn: async (dto) => {
      const response = await meetEndpoints.getMeetToken(dto);
      return response.roomUrl;
    },
    onError: () => {
      showNotification({
        id: `create-call-error-${Date.now()}`,
        title: 'Не удалось войти в звонок',
        subtitle: ROOM_NOT_CREATED_MESSAGE,
        priority: 'high',
        time: 5000,
      });
    },
  });
}
