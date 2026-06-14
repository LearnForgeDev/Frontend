import { createApiClient } from './factory';

const apiClient = createApiClient(import.meta.env.VITE_API_BASE_URL);

export interface LoginResponseDto {
  jwtToken: string;
  refreshToken: string;
  userName: string;
  userPublicId: string;
  userRoles: Array<{ role: number; schoolId: number; userId: number }>;
}

export interface MySchool {
  id: number;
  name: string;
  publicId: string;
}

export const authEndpoints = {
  async login(dto: { name: string; password: string }): Promise<LoginResponseDto> {
    const response = await apiClient.post<LoginResponseDto>('/api/ApiAuth/login', dto);
    return response.data;
  },

  async refreshToken(): Promise<void> {
    await apiClient.post('/api/ApiAuth/refreshToken');
  },

  async getMySchools(): Promise<MySchool[]> {
    const response = await apiClient.get<MySchool[]>('/api/ApiSchool/my-schools');
    return response.data;
  }
};
