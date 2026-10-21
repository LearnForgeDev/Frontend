import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schoolsEndpoints } from '@/Endpoints';
import { useToast } from '@/Storage/useToastStore';
import { getProvisioningError, normalizeProvisioningRequests } from '../DeveloperRequestsPage.utils';
import { REQUESTS_QUERY_KEY } from '../DeveloperRequestsPage.const';

export function useProvisioningRequests() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const requestsQuery = useQuery({
    queryKey: REQUESTS_QUERY_KEY,
    retry: false,
    networkMode: 'always',
    queryFn: async () => {
      try {
        return normalizeProvisioningRequests(await schoolsEndpoints.getProvisioningRequests(true));
      } catch (error) {
        toast.error(getProvisioningError(error).message);
        throw error;
      }
    },
  });

  const refreshRequests = () => queryClient.invalidateQueries({
    queryKey: REQUESTS_QUERY_KEY,
  });

  const onMutationError = (error: unknown) => {
    toast.error(getProvisioningError(error).requiresLogin
      ? 'Сессия администратора завершена. Войдите снова.'
      : 'Не удалось изменить заявку. Попробуйте ещё раз.');
  };

  const approveRequest = useMutation({
    networkMode: 'always',
    mutationFn: (publicId: string) => schoolsEndpoints.approveProvisioningRequest(publicId),
    onSuccess: refreshRequests,
    onError: onMutationError,
  });

  const rejectRequest = useMutation({
    networkMode: 'always',
    mutationFn: (publicId: string) => schoolsEndpoints.rejectProvisioningRequest(publicId),
    onSuccess: refreshRequests,
    onError: onMutationError,
  });

  const mutationError = approveRequest.error ?? rejectRequest.error;
  const error = requestsQuery.error ?? (getProvisioningError(mutationError).requiresLogin ? mutationError : null);
  const retryRequests = () => {
    approveRequest.reset();
    rejectRequest.reset();
    void requestsQuery.refetch();
  };

  return {
    requestsQuery, approveRequest, rejectRequest, retryRequests,
    isMutating: approveRequest.isPending || rejectRequest.isPending,
    error: error ? getProvisioningError(error) : null,
  };
}
