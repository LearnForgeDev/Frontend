import { isAxiosError } from 'axios';
import { HTTP_STATUS } from '../factory/factory.const';
import { REFRESH_RETRY_COUNT } from './auth.const';
import { getRefreshRetryDelay, parseJwt } from './utils';
import { createApiClient, createQueryFn, createQueryFnWithRefresh } from '../factory/factory';
import { useGlobalContext } from "@/Storage/useGlobalContext/useGlobalContext.ts";
import type {
    LoginParams,
    RegisterParams,
    RequestSchoolParams,
    RefreshTokenParams,
    InviteParams,
    JoinSchoolByInviteParams,
    SchoolRequestStatusDto
} from './types';
import type { UserIdentity } from "@/Assets/Types/commonTypes.ts";

export * from './types';

const apiClient = createApiClient({ staleTime: 0 });
const queryFn = createQueryFn();
const protectedQueryFn = createQueryFnWithRefresh();

export const authEndpoints = {
    async register(dto: RegisterParams): Promise<UserIdentity> {
        const queryKey = ['/api/ApiAuth/reg'];

        const response = await apiClient.fetchQuery({
            queryKey,
            queryFn: () => queryFn.post<UserIdentity>(queryKey[0], dto)
        });

        const parsedJwtToken = parseJwt(response.data.jwtToken);
        const exp = Number(parsedJwtToken.exp) * 1000;

        const user = { ...response.data, exp };
        return user;
    },

    async login(dto: LoginParams): Promise<UserIdentity> {
        const queryKey = ['/api/ApiAuth/login'];
        const response = await apiClient.fetchQuery({
            queryKey,
            queryFn: () => queryFn.post<UserIdentity>(queryKey[0], dto)
        });

        const parsedJwtToken = parseJwt(response.data.jwtToken);
        const exp = Number(parsedJwtToken.exp) * 1000;

        const user = { ...response.data, exp };
        return user;
    },

    async refreshToken(dto?: RefreshTokenParams): Promise<UserIdentity> {
        const path = '/api/ApiAuth/refreshToken';
        const response = await apiClient.fetchQuery({
            queryKey: [path, dto?.refreshToken],
            networkMode: 'always',
            queryFn: ({ signal }) => queryFn.post<UserIdentity>(path, dto || {}, { signal }),
            retry: (failureCount, error) => failureCount < REFRESH_RETRY_COUNT
                && isAxiosError(error) && error.response?.status === HTTP_STATUS.TOO_MANY_REQUESTS,
            retryDelay: (_attempt, error) => getRefreshRetryDelay(error),
        });
        return response.data;
    },

    async createSchool(dto: RequestSchoolParams): Promise<SchoolRequestStatusDto> {
        const queryKey = ['/api/ApiAuth/create-school'];
        const response = await apiClient.fetchQuery({
            queryKey: [...queryKey, dto],
            queryFn: () => protectedQueryFn.post<SchoolRequestStatusDto>(queryKey[0], dto)
        });
        return response.data;
    },

    async requestSchool(dto: RequestSchoolParams): Promise<SchoolRequestStatusDto> {
        const queryKey = ['/api/ApiAuth/request-school'];
        const response = await apiClient.fetchQuery({
            queryKey: [...queryKey, dto],
            queryFn: () => protectedQueryFn.post<SchoolRequestStatusDto>(queryKey[0], dto)
        });
        return response.data;
    },

    async getSchoolRequestStatus(publicId: string): Promise<SchoolRequestStatusDto> {
        const queryKey = [`/api/ApiAuth/request-school/${publicId}/status`];
        const response = await apiClient.fetchQuery({
            queryKey,
            queryFn: () => protectedQueryFn.get<SchoolRequestStatusDto>(queryKey[0])
        });
        return response.data;
    },

    async getAllSchoolRequests(): Promise<SchoolRequestStatusDto[]> {
        const queryKey = ['/api/ApiAuth/request-school/all'];
        const response = await apiClient.fetchQuery({
            queryKey,
            queryFn: () => protectedQueryFn.get<SchoolRequestStatusDto[]>(queryKey[0])
        });
        return response.data;
    },

    async joinSchool(dto: JoinSchoolByInviteParams): Promise<UserIdentity> {
        const queryKey = ['/api/ApiAuth/join-school'];
        const response = await apiClient.fetchQuery({
            queryKey: [...queryKey, dto],
            queryFn: () => protectedQueryFn.post<UserIdentity>(queryKey[0], dto)
        });
        useGlobalContext.getState().auth.setUser(response.data);
        return response.data;
    },

    async invite(dto: InviteParams): Promise<unknown> {
        const queryKey = ['/api/ApiAuth/invite'];
        const response = await apiClient.fetchQuery({
            queryKey: [...queryKey, dto],
            queryFn: () => protectedQueryFn.post(queryKey[0], dto)
        });
        return response.data;
    }
};
