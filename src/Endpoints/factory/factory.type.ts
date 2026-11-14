import type { InternalAxiosRequestConfig } from 'axios';
import type { UserIdentity } from '@/Assets/Types/commonTypes';

export type SessionRequestConfig = InternalAxiosRequestConfig & {
  sessionIdentity?: RequestSession;
  sessionRetried?: boolean;
};

export type RequestSession = Pick<UserIdentity, 'jwtToken' | 'refreshToken' | 'userPublicId' | 'activeSchoolPublicId'>;
