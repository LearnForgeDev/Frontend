import { createApiClient, createQueryFnWithRefresh } from '../factory/factory';
import type {
  CreateJitsiTokenRequest,
  JitsiTokenResponse,
  ScreenShareRequestModel,
  ScreenShareResponse,
  ModerateScreenShareRequestModel,
  EndJitsiRoomRequest,
  SaveWhiteboardArchivePointerRequest,
  WhiteboardArchiveResponse
} from './types';

const apiClient = createApiClient({ staleTime: 0 });
const queryFn = createQueryFnWithRefresh();

export const meetEndpoints = {
  async getMeetToken(dto: CreateJitsiTokenRequest): Promise<JitsiTokenResponse> {
    const queryKey = ['/api/ApiMeet/token'];
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, dto],
      queryFn: () => queryFn.post<JitsiTokenResponse>(queryKey[0], dto),
    });
    return response.data;
  },

  async requestScreenShare(dto: ScreenShareRequestModel): Promise<ScreenShareResponse> {
    const queryKey = ['/api/ApiMeet/screen-share/request'];
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, dto],
      queryFn: () => queryFn.post<ScreenShareResponse>(queryKey[0], dto),
    });
    return response.data;
  },

  async approveScreenShare(dto: ModerateScreenShareRequestModel): Promise<ScreenShareResponse> {
    const queryKey = ['/api/ApiMeet/screen-share/approve'];
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, dto],
      queryFn: () => queryFn.post<ScreenShareResponse>(queryKey[0], dto),
    });
    return response.data;
  },

  async rejectScreenShare(dto: ModerateScreenShareRequestModel): Promise<ScreenShareResponse> {
    const queryKey = ['/api/ApiMeet/screen-share/reject'];
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, dto],
      queryFn: () => queryFn.post<ScreenShareResponse>(queryKey[0], dto),
    });
    return response.data;
  },

  async getScreenShareStatus(schoolPublicId: string, room: string, participantUserPublicId: string): Promise<unknown> {
    const queryKey = [`/api/ApiMeet/screen-share/status?schoolPublicId=${schoolPublicId}&room=${room}&participantUserPublicId=${participantUserPublicId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get(queryKey[0]),
    });
    return response.data;
  },

  async getScreenShareRequests(schoolPublicId: string, room: string): Promise<unknown[]> {
    const queryKey = [`/api/ApiMeet/screen-share/requests?schoolPublicId=${schoolPublicId}&room=${room}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get(queryKey[0]),
    });
    return response.data;
  },

  async endRoom(dto: EndJitsiRoomRequest): Promise<void> {
    const queryKey = ['/api/ApiMeet/rooms/end'];
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, dto],
      queryFn: () => queryFn.post<void>(queryKey[0], dto),
    });
    return response.data;
  },

  async archiveWhiteboardPointer(dto: SaveWhiteboardArchivePointerRequest): Promise<WhiteboardArchiveResponse> {
    const queryKey = ['/api/ApiMeet/whiteboard/archive-pointer'];
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, dto],
      queryFn: () => queryFn.post<WhiteboardArchiveResponse>(queryKey[0], dto),
    });
    return response.data;
  },

  async getLatestWhiteboard(schoolPublicId: string, room: string): Promise<unknown> {
    const queryKey = [`/api/ApiMeet/whiteboard/latest?schoolPublicId=${schoolPublicId}&room=${room}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get(queryKey[0]),
    });
    return response.data;
  }
};
