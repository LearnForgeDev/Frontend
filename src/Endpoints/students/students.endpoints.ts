import { createApiClient, createQueryFnWithRefresh } from '../factory/factory';
import type { StudentDto, SimpleStudentDto, StudentGroupDto } from './types';

const apiClient = createApiClient({});
const queryFn = createQueryFnWithRefresh();

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
};
