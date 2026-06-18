import { createApiClient } from './factory';
import type {
  ApiFile,
  PresignRequestDto,
  PresignResponseDto,
  CompleteUploadDto
} from './files.types.ts';
import config from '../config';

const apiClient = createApiClient(config.endpointUrl);

export const filesEndpoints = {
  /**
   * GET /api/ApiFiles/{schoolId}
   */
  async listFiles(schoolId: number | string): Promise<ApiFile[]> {
    const response = await apiClient.get<ApiFile[]>(`/api/ApiFiles/${schoolId}`);
    return response.data;
  },

  /**
   * POST /api/ApiFiles/{schoolId}/direct-upload/presign
   */
  async getPresignedUpload(schoolId: number | string, dto: PresignRequestDto): Promise<PresignResponseDto> {
    const response = await apiClient.post<PresignResponseDto>(`/api/ApiFiles/${schoolId}/direct-upload/presign`, dto);
    return response.data;
  },

  /**
   * POST /api/ApiFiles/{schoolId}/direct-upload/complete
   */
  async completeUpload(schoolId: number | string, dto: CompleteUploadDto): Promise<ApiFile> {
    const response = await apiClient.post<ApiFile>(`/api/ApiFiles/${schoolId}/direct-upload/complete`, dto);
    return response.data;
  },

  /**
   * GET /api/ApiFiles/{schoolId}/{fileId}/content
   */
  async getFileContent(schoolId: number | string, fileId: string): Promise<string> {
    const response = await apiClient.get<string>(`/api/ApiFiles/${schoolId}/${fileId}/content`);
    return response.data;
  },

  /**
   * GET /api/ApiFiles/{schoolId}/{fileId}/content as Blob
   */
  async getFileBlob(schoolId: number | string, fileId: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(`/api/ApiFiles/${schoolId}/${fileId}/content`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * PUT {uploadUrl}
   */
  async uploadFileDirect(uploadUrl: string, content: string | Blob, contentType?: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (contentType) {
      headers['Content-Type'] = contentType;
    } else if (typeof content === 'string') {
      headers['Content-Type'] = 'application/json';
    } else if (content instanceof Blob && content.type) {
      headers['Content-Type'] = content.type;
    }

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers,
      body: content,
    });
    if (!response.ok) {
      throw new Error(`Direct upload failed: ${response.statusText}`);
    }
  },

  /**
   * DELETE /api/ApiFiles/{schoolId}/{fileId}
   */
  async deleteFile(schoolId: number | string, fileId: string): Promise<void> {
    await apiClient.delete(`/api/ApiFiles/${schoolId}/${fileId}`);
  },
  }
};
