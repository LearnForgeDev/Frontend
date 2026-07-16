import { createApiClient, createQueryFnWithRefresh } from '../factory/factory';
import type { UserSchoolInfo, SchoolInfo, MemberDto } from './types';

const apiClient = createApiClient({});
const queryFn = createQueryFnWithRefresh();

export const schoolsEndpoints = {
  async getMySchools(): Promise<UserSchoolInfo[]> {
    const queryKey = ['/api/ApiSchool/my-schools'];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<UserSchoolInfo[]>(queryKey[0]),
    });
    return response.data;
  },

  async createSchool(schoolName: string): Promise<void> {
    const queryKey = [`/api/ApiSchool/create?schoolName=${encodeURIComponent(schoolName)}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.post<void>(queryKey[0]),
    });
    return response.data;
  },

  async getSchoolInfo(schoolPublicId: string): Promise<SchoolInfo> {
    const queryKey = [`/api/ApiSchool/${schoolPublicId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<SchoolInfo>(queryKey[0]),
    });
    return response.data;
  },

  async listMembers(schoolPublicId: string): Promise<MemberDto[]> {
    const queryKey = [`/api/ApiSchool/${schoolPublicId}/members`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<MemberDto[]>(queryKey[0]),
    });
    return response.data;
  },

  async getProvisioningRequests(includeRejected: boolean = true): Promise<unknown[]> {
    const queryKey = [`/api/ApiSchool/provisioning-requests?includeRejected=${includeRejected}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<unknown[]>(queryKey[0]),
    });
    return response.data;
  },

  async approveProvisioningRequest(publicId: string): Promise<void> {
    const queryKey = [`/api/ApiSchool/provisioning-requests/${publicId}/approve`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.post<void>(queryKey[0]),
    });
    return response.data;
  },

  async rejectProvisioningRequest(publicId: string): Promise<void> {
    const queryKey = [`/api/ApiSchool/provisioning-requests/${publicId}/reject`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.post<void>(queryKey[0]),
    });
    return response.data;
  },

  async getStudents(schoolPublicId: string): Promise<unknown[]> {
    const queryKey = [`/api/ApiStudents/${schoolPublicId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<unknown[]>(queryKey[0]),
    });
    return response.data;
  },

  async getStudentsSimple(schoolPublicId: string): Promise<unknown[]> {
    const queryKey = [`/api/ApiStudents/${schoolPublicId}/simple`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<unknown[]>(queryKey[0]),
    });
    return response.data;
  },

  async getStudentById(schoolPublicId: string, studentPublicId: string): Promise<unknown> {
    const queryKey = [`/api/ApiStudents/${schoolPublicId}/${studentPublicId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<unknown>(queryKey[0]),
    });
    return response.data;
  },

  async getStudentGroups(schoolPublicId: string): Promise<unknown[]> {
    const queryKey = [`/api/ApiStudents/${schoolPublicId}/groups`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<unknown[]>(queryKey[0]),
    });
    return response.data;
  },

  async uploadAvatar(schoolPublicId: string, file: File): Promise<string> {
    const queryKey = [`/api/ApiStudents/${schoolPublicId}/avatar`];
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, file.name],
      queryFn: () => queryFn.post<string>(queryKey[0], formData),
    });
    return response.data;
  },
};
