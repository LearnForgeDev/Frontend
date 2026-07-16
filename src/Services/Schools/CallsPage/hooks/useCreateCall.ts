import { useMutation } from '@tanstack/react-query';
import { meetEndpoints } from '@/Endpoints';
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';
import type { AppError } from '@/Endpoints';
import type { CreateJitsiTokenRequest } from '@/Endpoints';

export function useCreateCall() {
  const showNotification = useGlobalNotificationStore((s) => s.pushNotification);

  return useMutation<string, AppError, CreateJitsiTokenRequest>({
    mutationFn: async (dto) => {
      const response = await meetEndpoints.getMeetToken(dto);
      return response.roomUrl;
    },
    onError: (error) => {
      let message = error.message || 'Failed to create call.';
      if (error.code === 'FORBIDDEN') {
        message = 'You do not have permission to create a call.';
      }

      showNotification({
        id: `create-call-error-${Date.now()}`,
        title: 'Error Creating Call',
        subtitle: message,
        priority: 'high',
        time: 5000,
      });
    },
  });
}
