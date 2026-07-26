import { createQueryFn } from '../factory/factory';

const queryFn = createQueryFn();

export const checkHealthEndpoints = {
  async checkHealth(): Promise<boolean> {
    try {
      const response = await queryFn.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
};
