import { createApiClient } from './factory';
import config from '../config';
import type {
  MeetTokenRequestDto,
  JitsiTokenResponse,
  ScreenShareRequestDto,
  ScreenShareResponse,
  ScreenShareApproveDto,
  WhiteboardArchiveDto,
  WhiteboardArchiveResponse
} from './meet.types';

const apiClient = createApiClient(config.endpointUrl);

export const meetEndpoints = {
  /**
   * POST /api/ApiMeet/token
   * Получить JWT для Jitsi
   */
  async getMeetToken(dto: MeetTokenRequestDto): Promise<JitsiTokenResponse> {
    const response = await apiClient.post<JitsiTokenResponse>('/api/ApiMeet/token', dto);
    return response.data;
  },

  /**
   * POST /api/ApiMeet/screen-share/request
   * Запрос на расшаривание экрана (для учеников)
   */
  async requestScreenShare(dto: ScreenShareRequestDto): Promise<ScreenShareResponse> {
    const response = await apiClient.post<ScreenShareResponse>('/api/ApiMeet/screen-share/request', dto);
    return response.data;
  },

  /**
   * POST /api/ApiMeet/screen-share/approve
   * Одобрение расшаривания (только Teacher/Owner)
   */
  async approveScreenShare(dto: ScreenShareApproveDto): Promise<ScreenShareResponse> {
    const response = await apiClient.post<ScreenShareResponse>('/api/ApiMeet/screen-share/approve', dto);
    return response.data;
  },

  /**
   * POST /api/ApiMeet/whiteboard/archive-pointer
   * Сохранить ссылку на доску Excalidraw после завершения сессии
   */
  async archiveWhiteboardPointer(dto: WhiteboardArchiveDto): Promise<WhiteboardArchiveResponse> {
    const response = await apiClient.post<WhiteboardArchiveResponse>('/api/ApiMeet/whiteboard/archive-pointer', dto);
    return response.data;
  }
};
