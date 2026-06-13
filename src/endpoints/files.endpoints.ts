import { createApiClient } from './factory';
import type {
  ApiFile,
  PresignRequestDto,
  PresignResponseDto,
  CompleteUploadDto
} from './files.types.ts';

const apiClient = createApiClient(import.meta.env.VITE_API_BASE_URL);

export const filesEndpoints = {
  /**
   * GET /api/ApiFiles/{schoolId}
   */
  async listFiles(schoolId: number): Promise<ApiFile[]> {
    const response = await apiClient.get<ApiFile[]>(`/api/ApiFiles/${schoolId}`);
    return response.data;
  },

  /**
   * POST /api/ApiFiles/{schoolId}/direct-upload/presign
   */
  async getPresignedUpload(schoolId: number, dto: PresignRequestDto): Promise<PresignResponseDto> {
    const response = await apiClient.post<PresignResponseDto>(`/api/ApiFiles/${schoolId}/direct-upload/presign`, dto);
    return response.data;
  },

  /**
   * POST /api/ApiFiles/{schoolId}/direct-upload/complete
   */
  async completeUpload(schoolId: number, dto: CompleteUploadDto): Promise<ApiFile> {
    const response = await apiClient.post<ApiFile>(`/api/ApiFiles/${schoolId}/direct-upload/complete`, dto);
    return response.data;
  },

  /**
   * GET /api/ApiFiles/{schoolId}/{fileId}/content
   */
  async getFileContent(schoolId: number, fileId: string): Promise<string> {
    const response = await apiClient.get<string>(`/api/ApiFiles/${schoolId}/${fileId}/content`);
    return response.data;
  },

  /**
   * PUT {uploadUrl}
   */
  async uploadFileDirect(uploadUrl: string, content: string): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: content,
    });
    if (!response.ok) {
      throw new Error(`Direct upload failed: ${response.statusText}`);
    }
  },

  /**
   * DELETE /api/ApiFiles/{schoolId}/{fileId}
   */
  async deleteFile(schoolId: number, fileId: string): Promise<void> {
    await apiClient.delete(`/api/ApiFiles/${schoolId}/${fileId}`);
  }
};
