import { createApiClient, createQueryFnWithRefresh } from '../factory/factory';
import type {
  ApiFile,
  RequestDirectUploadUrlRequest,
  PresignResponseDto,
  CompleteDirectUploadRequest,
  UpdateFileAccessRequest
} from './types';
import config from '../../config';

const apiClient = createApiClient({});
const queryFn = createQueryFnWithRefresh();

export const filesEndpoints = {
  async listFiles(schoolPublicId: string): Promise<ApiFile[]> {
    const queryKey = [`/api/ApiFiles/${schoolPublicId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<ApiFile[]>(queryKey[0]),
    });
    return response.data;
  },

  async getPresignedUpload(schoolPublicId: string, dto: RequestDirectUploadUrlRequest): Promise<PresignResponseDto> {
    const queryKey = [`/api/ApiFiles/${schoolPublicId}/direct-upload/presign`];
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, dto],
      queryFn: () => queryFn.post<PresignResponseDto>(queryKey[0], dto),
    });
    return response.data;
  },

  async completeUpload(schoolPublicId: string, dto: CompleteDirectUploadRequest): Promise<ApiFile> {
    const queryKey = [`/api/ApiFiles/${schoolPublicId}/direct-upload/complete`];
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, dto],
      queryFn: () => queryFn.post<ApiFile>(queryKey[0], dto),
    });
    return response.data;
  },

  async getFileContent(schoolPublicId: string, filePublicId: string): Promise<string> {
    const queryKey = [`/api/ApiFiles/${schoolPublicId}/${filePublicId}/content`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<string>(queryKey[0]),
    });
    return response.data;
  },

  async getFileBlob(schoolPublicId: string, filePublicId: string): Promise<Blob> {
    const queryKey = [`/api/ApiFiles/${schoolPublicId}/${filePublicId}/content`, 'blob'];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<ArrayBuffer>(queryKey[0], { responseType: 'arraybuffer' }),
    });
    const contentType = (response.headers['content-type'] as string) || 'application/octet-stream';
    return new Blob([response.data], { type: contentType });
  },

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

  async deleteFile(schoolPublicId: string, filePublicId: string): Promise<void> {
    const queryKey = [`/api/ApiFiles/${schoolPublicId}/${filePublicId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.delete<void>(queryKey[0]),
    });
    return response.data;
  },

  async uploadFileMultipart(schoolPublicId: string, file: File, allowedUserPublicIds?: string[], allowedGroupIds?: number[]): Promise<ApiFile> {
    const queryKey = [`/api/ApiFiles/${schoolPublicId}`];
    const formData = new FormData();
    formData.append('File', file);
    formData.append('FileName', file.name);
    
    if (allowedUserPublicIds) {
      allowedUserPublicIds.forEach((id) => formData.append('AllowedUserPublicIds', id));
    }
    if (allowedGroupIds) {
      allowedGroupIds.forEach((id) => formData.append('AllowedGroupIds', id.toString()));
    }
    
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, file.name],
      queryFn: () => queryFn.post<ApiFile>(queryKey[0], formData),
    });
    return response.data;
  },

  async updateFileAccess(schoolPublicId: string, filePublicId: string, dto: UpdateFileAccessRequest): Promise<void> {
    const queryKey = [`/api/ApiFiles/${schoolPublicId}/${filePublicId}/access`];
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, dto],
      queryFn: () => queryFn.put<void>(queryKey[0], dto),
    });
    return response.data;
  },

  getFileUrl(schoolPublicId: string, filePublicId: string): string {
    return `${config.endpointUrl}/api/ApiFiles/${schoolPublicId}/${filePublicId}/content`;
  }
};
