import { createApiClient } from './factory';
import config from '../config';

const apiClient = createApiClient(config.endpointUrl);

// Mirrors the backend Role enum (Student/Teacher/Owner); Founder/Admin kept for
// any legacy/platform values that may still appear.
export type SchoolRole = "Teacher" | "Student" | "Owner" | "Founder" | "Admin";

export interface UserSchoolInfo {
  schoolPublicId: string;
  schoolName: string;
  roles: SchoolRole[];
}

/** Response item for GET /api/ApiSchool/{schoolId}/members. */
export interface MemberDto {
  userPublicId: string;
  displayName: string;
}

export const schoolsEndpoints = {
  /**
   * GET /api/ApiSchool/my-schools
   */
  async getMySchools(): Promise<UserSchoolInfo[]> {
    const response = await apiClient.get<UserSchoolInfo[]>('/api/ApiSchool/my-schools');
    return response.data;
  },

  /**
   * GET /api/ApiSchool/{schoolId}/members
   * Lists the tenant's members (for the attendee picker). SchoolMember-gated.
   */
  async listMembers(schoolId: number | string): Promise<MemberDto[]> {
    const response = await apiClient.get<MemberDto[]>(`/api/ApiSchool/${schoolId}/members`);
    return response.data;
  }
};
