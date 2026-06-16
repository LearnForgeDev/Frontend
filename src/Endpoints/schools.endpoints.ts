import { createApiClient } from './factory';
import config from '../config';

const apiClient = createApiClient(config.endpointUrl);

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
