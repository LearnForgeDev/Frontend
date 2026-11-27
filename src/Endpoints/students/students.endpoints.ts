import { createApiClient, createQueryFnWithRefresh } from '../factory/factory';
import type { ManagedStudentGroup, SimpleStudentDto, StudentDto, StudentGroupDirectory, StudentGroupDto } from './students.contract.type';

const apiClient = createApiClient({});
const queryFn = createQueryFnWithRefresh();

function managedGroupsPath(schoolPublicId: string) {
  return `/api/ApiStudentGroups/${encodeURIComponent(schoolPublicId)}`;
}

export const studentsEndpoints = {
  async getStudents(schoolPublicId: string): Promise<StudentDto[]> {
    const queryKey = [`/api/ApiStudents/${schoolPublicId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<StudentDto[]>(queryKey[0]),
    });
    return response.data;
  },

  async getStudentsSimple(schoolPublicId: string): Promise<SimpleStudentDto[]> {
    const queryKey = [`/api/ApiStudents/${schoolPublicId}/simple`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<SimpleStudentDto[]>(queryKey[0]),
    });
    return response.data;
  },

  async getStudentById(schoolPublicId: string, studentPublicId: string): Promise<StudentDto> {
    const queryKey = [`/api/ApiStudents/${schoolPublicId}/${studentPublicId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<StudentDto>(queryKey[0]),
    });
    return response.data;
  },

  async getStudentGroups(schoolPublicId: string): Promise<StudentGroupDto[]> {
    const queryKey = [`/api/ApiStudents/${schoolPublicId}/groups`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<StudentGroupDto[]>(queryKey[0]),
    });
    return response.data;
  },

  async getManagedGroups(schoolPublicId: string): Promise<StudentGroupDirectory> {
    return (await queryFn.get<StudentGroupDirectory>(managedGroupsPath(schoolPublicId))).data;
  },

  async createGroup(schoolPublicId: string, { publicId, name, memberPublicIds }: ManagedStudentGroup): Promise<ManagedStudentGroup> {
    return (await queryFn.post<ManagedStudentGroup>(`${managedGroupsPath(schoolPublicId)}/${encodeURIComponent(publicId)}`, {
      name, memberPublicIds,
    })).data;
  },

  async updateGroup(schoolPublicId: string, { publicId, name, memberPublicIds }: ManagedStudentGroup): Promise<ManagedStudentGroup> {
    return (await queryFn.put<ManagedStudentGroup>(`${managedGroupsPath(schoolPublicId)}/${encodeURIComponent(publicId)}`, {
      name, memberPublicIds,
    })).data;
  },

  async deleteGroup(schoolPublicId: string, publicId: string): Promise<void> {
    await queryFn.delete(`${managedGroupsPath(schoolPublicId)}/${encodeURIComponent(publicId)}`);
  },
};
