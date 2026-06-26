import { createApiClient, createQueryFn } from '../factory/factory';

const apiClient = createApiClient({});
const queryFn = createQueryFn();

export const checkHealthEndpoints = {
  async checkHealth(): Promise<boolean> {
    const queryKey = ['/health'];
    try {
      const response = await apiClient.fetchQuery({
        queryKey,
        queryFn: () => queryFn.get(queryKey[0]),
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
};
