import { createApiClient } from './factory';

const apiClient = createApiClient(import.meta.env.VITE_API_BASE_URL || '');

export interface JitsiTokenResponse {
  roomUrl: string;
}

export interface ScreenShareResponse {
  success: boolean;
}

export interface WhiteboardArchiveResponse {
  success: boolean;
}

export const meetEndpoints = {
  /**
   * POST /api/ApiMeet/token
   * Получить JWT для Jitsi
   */
  async getMeetToken(dto: { schoolPublicId: string; roomName: string }): Promise<JitsiTokenResponse> {
    const response = await apiClient.post<JitsiTokenResponse>('/api/ApiMeet/token', dto);
    return response.data;
  },

  /**
   * POST /api/ApiMeet/screen-share/request
   * Запрос на расшаривание экрана (для учеников)
   */
  async requestScreenShare(dto: { schoolPublicId: string; roomName: string }): Promise<ScreenShareResponse> {
    const response = await apiClient.post<ScreenShareResponse>('/api/ApiMeet/screen-share/request', dto);
    return response.data;
  },

  /**
   * POST /api/ApiMeet/screen-share/approve
   * Одобрение расшаривания (только Teacher/Owner)
   */
  async approveScreenShare(dto: { schoolPublicId: string; roomName: string; userPublicId: string }): Promise<ScreenShareResponse> {
    const response = await apiClient.post<ScreenShareResponse>('/api/ApiMeet/screen-share/approve', dto);
    return response.data;
  },

  /**
   * POST /api/ApiMeet/whiteboard/archive-pointer
   * Сохранить ссылку на доску Excalidraw после завершения сессии
   */
  async archiveWhiteboardPointer(dto: { schoolPublicId: string; roomName: string; whiteboardUrl: string }): Promise<WhiteboardArchiveResponse> {
    const response = await apiClient.post<WhiteboardArchiveResponse>('/api/ApiMeet/whiteboard/archive-pointer', dto);
    return response.data;
  }
};
