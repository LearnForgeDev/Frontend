import { createApiClient } from './factory';
import config from '../config';

const apiClient = createApiClient(config.endpointUrl);

export interface LoginResponseDto {
  jwtToken: string;
  refreshToken: string;
  userName: string;
  userPublicId: string;
  userRoles: Array<{ role: number; schoolId: number; userId: number }>;
}

export type LoginParams = {
  name: string;
  password: string;
};

export type RegisterFounderParams = LoginParams & {
  confirmPassword: string;
};

export type RegisterStudentParams = RegisterFounderParams & {
  inviteToken: string;
};

export type RequestSchoolParams = {
  schoolName: string;
};

export type RefreshTokenParams = {
  refreshToken: string;
};

export type InviteParams = {
  schoolPublicId: string;
  role: number;
  maxUses?: number;
  expiresInMinutes?: number;
};

export type JoinSchoolByInviteParams = {
  inviteToken: string;
};

export type SchoolRequestStatusDto = {
  requestPublicId: string;
  status: string;
  schoolName?: string;
  requestedAt?: string;
};

export const authEndpoints = {
  async registerStudent(dto: RegisterStudentParams): Promise<LoginResponseDto> {
    const response = await apiClient.post<LoginResponseDto>('/api/ApiAuth/reg', dto);
    return response.data;
  },

  async registerFounder(dto: RegisterFounderParams): Promise<LoginResponseDto> {
    const response = await apiClient.post<LoginResponseDto>('/api/ApiAuth/reg', dto);
    return response.data;
  },

  async login(dto: LoginParams): Promise<LoginResponseDto> {
    const response = await apiClient.post<LoginResponseDto>('/api/ApiAuth/login', dto);
    return response.data;
  },

  async refreshToken(dto?: RefreshTokenParams): Promise<LoginResponseDto> {
    const response = await apiClient.post<LoginResponseDto>('/api/ApiAuth/refreshToken', dto || {});
    return response.data;
  },

  async requestSchool(dto: RequestSchoolParams): Promise<SchoolRequestStatusDto> {
    const response = await apiClient.post<SchoolRequestStatusDto>('/api/ApiAuth/request-school', dto);
    return response.data || { requestPublicId: "", status: "Accepted" };
  },

  async getSchoolRequestStatus(publicId: string): Promise<SchoolRequestStatusDto> {
    const response = await apiClient.get<SchoolRequestStatusDto>(`/api/ApiAuth/request-school/${publicId}/status`);
    return response.data;
  },

  async getAllSchoolRequests(): Promise<SchoolRequestStatusDto[]> {
    const response = await apiClient.get<SchoolRequestStatusDto[]>('/api/ApiAuth/request-school/all');
    return response.data;
  },

  async joinSchool(dto: JoinSchoolByInviteParams): Promise<LoginResponseDto> {
    const response = await apiClient.post<LoginResponseDto>('/api/ApiAuth/join-school', dto);
    return response.data;
  },

  async invite(dto: InviteParams): Promise<unknown> {
    const response = await apiClient.post('/api/ApiAuth/invite', dto);
    return response.data;
  }
};
