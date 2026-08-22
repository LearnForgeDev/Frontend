import { createApiClient, createQueryFnWithRefresh } from '../factory/factory';

const apiClient = createApiClient({});
const queryFn = createQueryFnWithRefresh();

export const profileEndpoints = {
  async uploadAvatar(file: File, schoolPublicId?: string): Promise<string> {
    const formData = new FormData();
    formData.append('File', file);
    if (schoolPublicId) {
      formData.append('SchoolPublicId', schoolPublicId);
    }
    const queryKey = ['/api/ApiProfile/avatar', file.name, schoolPublicId ?? ''];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.post<string>('/api/ApiProfile/avatar', formData),
    });
    return response.data;
  },
};
