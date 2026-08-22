import { createApiClient, createQueryFnWithRefresh } from '../factory/factory';
import type { Branch, BranchFile, BranchModel, UpdateBranchRequest } from './types';

const apiClient = createApiClient({});
const queryFn = createQueryFnWithRefresh();

export const branchesEndpoints = {
  async getBranches(schoolPublicId: string): Promise<Branch[]> {
    const queryKey = [`/api/ApiBreanches/${schoolPublicId}/all`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get(queryKey[0]),
    });
    return response.data;
  },

  async getBranch(schoolPublicId: string, branchId: string): Promise<Branch> {
    const queryKey = [`/api/ApiBreanches/${schoolPublicId}/${branchId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get(queryKey[0]),
    });
    return response.data;
  },

  async getBranchFiles(schoolPublicId: string, branchId: string): Promise<BranchFile[]> {
    const queryKey = [`/api/ApiBreanches/${schoolPublicId}/${branchId}/files`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get(queryKey[0]),
    });
    return response.data;
  },

  async getBranchHistory(schoolPublicId: string, branchId: string): Promise<unknown[]> {
    const queryKey = [`/api/ApiBreanches/${schoolPublicId}/${branchId}/history`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get(queryKey[0]),
    });
    return response.data;
  },

  async createBranch(schoolPublicId: string, dto: BranchModel): Promise<Branch> {
    const queryKey = [`/api/ApiBreanches/${schoolPublicId}/createBreanch`];
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, dto],
      queryFn: () => queryFn.post(queryKey[0], dto),
    });
    return response.data;
  },

  async updateBranch(schoolPublicId: string, branchId: string, dto: UpdateBranchRequest): Promise<void> {
    const queryKey = [`/api/ApiBreanches/${schoolPublicId}/${branchId}`];
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, dto],
      queryFn: () => queryFn.put(queryKey[0], dto),
    });
    return response.data;
  },

  async deleteBranch(schoolPublicId: string, branchId: string): Promise<void> {
    const queryKey = [`/api/ApiBreanches/${schoolPublicId}/${branchId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.delete(queryKey[0]),
    });
    return response.data;
  },

  async addBranchUser(schoolPublicId: string, branchId: string, userPublicId: string): Promise<void> {
    const queryKey = [`/api/ApiBreanches/${schoolPublicId}/${branchId}/users/${userPublicId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.post(queryKey[0], {}),
    });
    return response.data;
  },

  async removeBranchUser(schoolPublicId: string, branchId: string, userPublicId: string): Promise<void> {
    const queryKey = [`/api/ApiBreanches/${schoolPublicId}/${branchId}/users/${userPublicId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.delete(queryKey[0]),
    });
    return response.data;
  },

  async getBranchGroups(schoolPublicId: string, branchId: string): Promise<unknown[]> {
    const queryKey = [`/api/ApiBreanches/${schoolPublicId}/${branchId}/groups`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get(queryKey[0]),
    });
    return response.data;
  },

  async addBranchGroup(schoolPublicId: string, branchId: string, groupId: number): Promise<void> {
    const queryKey = [`/api/ApiBreanches/${schoolPublicId}/${branchId}/groups/${groupId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.post(queryKey[0], {}),
    });
    return response.data;
  },

  async removeBranchGroup(schoolPublicId: string, branchId: string, groupId: number): Promise<void> {
    const queryKey = [`/api/ApiBreanches/${schoolPublicId}/${branchId}/groups/${groupId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.delete(queryKey[0]),
    });
    return response.data;
  },
};
