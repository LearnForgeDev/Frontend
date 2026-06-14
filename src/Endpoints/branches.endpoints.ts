import { createApiClient } from './factory';

const apiClient = createApiClient(import.meta.env.VITE_API_BASE_URL || '');

export interface Branch {
  id: number;
  name: string;
  description: string;
}

export interface BranchFile {
  id: number;
  name: string;
  url: string;
  uploadedAt: string;
}

export const branchesEndpoints = {
  /**
   * GET /api/ApiBreanches/{schoolId}/all
   */
  async getAllBranches(schoolId: number | string): Promise<Branch[]> {
    const response = await apiClient.get<Branch[]>(`/api/ApiBreanches/${schoolId}/all`);
    return response.data;
  },

  /**
   * POST /api/ApiBreanches/{schoolId}/createBreanch
   */
  async createBranch(
    schoolId: number | string,
    dto: { name: string; description: string }
  ): Promise<Branch> {
    const response = await apiClient.post<Branch>(`/api/ApiBreanches/${schoolId}/createBreanch`, dto);
    return response.data;
  },

  /**
   * GET /api/ApiBreanches/{schoolId}/{id}/files
   */
  async getBranchFiles(schoolId: number | string, id: number): Promise<BranchFile[]> {
    const response = await apiClient.get<BranchFile[]>(`/api/ApiBreanches/${schoolId}/${id}/files`);
    return response.data;
  }
};
