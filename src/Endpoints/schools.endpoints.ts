import { createApiClient } from './factory';

const apiClient = createApiClient(import.meta.env.VITE_API_BASE_URL || '');

export type SchoolRole = "Teacher" | "Student" | "Founder" | "Admin";

export interface UserSchoolInfo {
  schoolPublicId: string;
  schoolName: string;
  roles: SchoolRole[];
}

export const schoolsEndpoints = {
  /**
   * GET /api/ApiSchool/my-schools
   */
  async getMySchools(): Promise<UserSchoolInfo[]> {
    const response = await apiClient.get<UserSchoolInfo[]>('/api/ApiSchool/my-schools');
    return response.data;
  }
};
