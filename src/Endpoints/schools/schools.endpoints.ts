import { createApiClient, createQueryFnWithRefresh } from '../factory/factory';
import type { UserSchoolInfo, SchoolInfo, MemberDto } from './schools.contract.type';
import { studentsEndpoints } from '../students/students.endpoints';
import { profileEndpoints } from '../profile/profile.endpoints';

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

  async getStudents(schoolPublicId: string): Promise<unknown[]> {
    return studentsEndpoints.getStudents(schoolPublicId);
  },

  async getStudentsSimple(schoolPublicId: string): Promise<unknown[]> {
    return studentsEndpoints.getStudentsSimple(schoolPublicId);
  },

  async getStudentById(schoolPublicId: string, studentPublicId: string): Promise<unknown> {
    return studentsEndpoints.getStudentById(schoolPublicId, studentPublicId);
  },

  async getStudentGroups(schoolPublicId: string): Promise<unknown[]> {
    return studentsEndpoints.getStudentGroups(schoolPublicId);
  },

  async uploadAvatar(schoolPublicId: string, file: File): Promise<string> {
    return profileEndpoints.uploadAvatar(file, schoolPublicId);
  },
};
