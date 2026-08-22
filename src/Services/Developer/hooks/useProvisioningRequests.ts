import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schoolsEndpoints } from '@/Endpoints';
import { normalizeProvisioningRequests } from '../DeveloperRequestsPage.utils';

export function useProvisioningRequests() {
  const queryClient = useQueryClient();
  const requestsQuery = useQuery({
    queryKey: ['developer', 'school-provisioning-requests'],
    queryFn: async () => normalizeProvisioningRequests(
      await schoolsEndpoints.getProvisioningRequests(true),
    ),
  });

  const refreshRequests = () => queryClient.invalidateQueries({
    queryKey: ['developer', 'school-provisioning-requests'],
  });

  const approveRequest = useMutation({
    mutationFn: (publicId: string) => schoolsEndpoints.approveProvisioningRequest(publicId),
    onSuccess: refreshRequests,
  });

  const rejectRequest = useMutation({
    mutationFn: (publicId: string) => schoolsEndpoints.rejectProvisioningRequest(publicId),
    onSuccess: refreshRequests,
  });

  return { requestsQuery, approveRequest, rejectRequest };
}
