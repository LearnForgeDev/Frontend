import { createApiClient, createQueryFnWithRefresh } from '../factory/factory';

const apiClient = createApiClient({});
const queryFn = createQueryFnWithRefresh();

export const chatEndpoints = {
  async getBranchHistory(schoolPublicId: string, branchId: number) {
    const queryKey = [`/api/ApiBreanches/${schoolPublicId}/${branchId}/history`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get(queryKey[0]),
    });
    return response.data;
  },

  async getDirectHistory(schoolPublicId: string, otherUserPublicId: string) {
    const queryKey = [`/api/ApiDirectChat/${schoolPublicId}/history/${otherUserPublicId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get(queryKey[0]),
    });
    return response.data;
  },

  async clearDirectHistory(schoolPublicId: string, otherUserPublicId: string): Promise<void> {
    const queryKey = [`/api/ApiDirectChat/${schoolPublicId}/history/${otherUserPublicId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.delete<void>(queryKey[0]),
    });
    return response.data;
  },

  async getDirectChatFiles(schoolPublicId: string, otherUserPublicId: string) {
    const queryKey = [`/api/ApiDirectChat/${schoolPublicId}/files/${otherUserPublicId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get(queryKey[0]),
    });
    return response.data;
  }
};
