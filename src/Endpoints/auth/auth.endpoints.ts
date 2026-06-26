import { createApiClient, createQueryFn } from '../factory/factory';
import { parseJwt } from "@/Endpoints/auth/utils.ts";
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

const apiClient = createApiClient({ staleTime: 12 * 60 * 60 * 1000 });
const queryFn = createQueryFn();

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
        useGlobalContext.getState().auth.setUser(user);
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
        useGlobalContext.getState().auth.setUser(user);
        return user;
    },

    async refreshToken(dto?: RefreshTokenParams): Promise<UserIdentity> {
        const queryKey = ['/api/ApiAuth/refreshToken'];
        const response = await apiClient.fetchQuery({
            queryKey,
            queryFn: () => queryFn.post<UserIdentity>(queryKey[0], dto || {})
        });
        useGlobalContext.getState().auth.setUser(response.data);
        return response.data;
    },

    async requestSchool(dto: RequestSchoolParams): Promise<SchoolRequestStatusDto> {
        const queryKey = ['/api/ApiAuth/request-school'];
        const response = await apiClient.fetchQuery({
            queryKey,
            queryFn: () => queryFn.post<SchoolRequestStatusDto>(queryKey[0], dto)
        });
        return response.data;
    },

    async getSchoolRequestStatus(publicId: string): Promise<SchoolRequestStatusDto> {
        const queryKey = [`/api/ApiAuth/request-school/${publicId}/status`];
        const response = await apiClient.fetchQuery({
            queryKey,
            queryFn: () => queryFn.get<SchoolRequestStatusDto>(queryKey[0])
        });
        return response.data;
    },

    async getAllSchoolRequests(): Promise<SchoolRequestStatusDto[]> {
        const queryKey = ['/api/ApiAuth/request-school/all'];
        const response = await apiClient.fetchQuery({
            queryKey,
            queryFn: () => queryFn.get<SchoolRequestStatusDto[]>(queryKey[0])
        });
        return response.data;
    },

    async joinSchool(dto: JoinSchoolByInviteParams): Promise<UserIdentity> {
        const queryKey = ['/api/ApiAuth/join-school'];
        const response = await apiClient.fetchQuery({
            queryKey,
            queryFn: () => queryFn.post<UserIdentity>(queryKey[0], dto)
        });
        useGlobalContext.getState().auth.setUser(response.data);
        return response.data;
    },

    async invite(dto: InviteParams): Promise<unknown> {
        const queryKey = ['/api/ApiAuth/invite'];
        const response = await apiClient.fetchQuery({
            queryKey,
            queryFn: () => queryFn.post(queryKey[0], dto)
        });
        return response.data;
    }
};
