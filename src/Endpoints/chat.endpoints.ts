/**
 * INVESTIGATION CONCLUSION:
 * After walking through every documented endpoint group (ApiAuth, ApiSchool, ApiBreanches, ApiFiles, ApiMeet, lessons),
 * there is NO existing resource that returns a list of people the tutor can message directly.
 * 
 * ACTION REQUIRED BY BACKEND TEAM:
 * A new endpoint must be declared and implemented to list available users for direct chat.
 * Suggested Path: GET /api/ApiSchool/{schoolId}/users OR GET /api/ApiDirectChat/{schoolId}/contacts
 * Required Response Shape: Array of { userPublicId: string, displayName: string, role: string }
 * Role Requirements: Accessible by authorized users within the school.
 */

import { createApiClient } from './factory';
import config from '../config';

const apiClient = createApiClient(config.endpointUrl);

// Assumed shape - BACKEND CONFIRMATION REQUIRED
// The API documentation for /api/ApiBreanches/{schoolId}/all does not specify the response body shape.
// Assuming it returns an array of these objects:
export interface ApiBranch {
  id: number;
  name: string;
  description?: string;
}

export const chatEndpoints = {
  /**
   * GET /api/ApiBreanches/{schoolId}/all
   * Fetches all branches (group chats) for a school.
   */
  async listBranches(schoolId: number): Promise<ApiBranch[]> {
    const response = await apiClient.get<ApiBranch[]>(`/api/ApiBreanches/${schoolId}/all`);
    return response.data;
  }
};
