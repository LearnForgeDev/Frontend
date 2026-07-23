import { createApiClient, createQueryFnWithRefresh } from '../factory/factory';
import type {
  ApiFile,
  RequestDirectUploadUrlRequest,
  PresignResponseDto,
  CompleteDirectUploadRequest,
  UpdateFileAccessRequest
} from './types';
import config from '../../config';
import { calculateContentMd5Base64 } from './md5.utils';

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

  async uploadFileDirect(
    uploadUrl: string,
    content: string | Blob,
    contentType?: string,
    contentMd5?: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);

      let effectiveContentType = contentType;
      if (!effectiveContentType) {
        if (typeof content === 'string') {
          effectiveContentType = 'application/json';
        } else if (content instanceof Blob && content.type) {
          effectiveContentType = content.type;
        }
      }

      if (effectiveContentType) {
        xhr.setRequestHeader('Content-Type', effectiveContentType);
      }
      if (contentMd5) {
        xhr.setRequestHeader('Content-MD5', contentMd5);
      }

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Direct upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Direct upload network error'));
      xhr.onabort = () => reject(new Error('Direct upload aborted'));

      xhr.send(content);
    });
  },

  async uploadFileDirectPipeline(
    schoolPublicId: string,
    file: File | Blob,
    fileName?: string,
    bucketType: string = 'files',
    allowedUserPublicIds?: string[],
    allowedGroupIds?: number[],
    onProgress?: (progress: number) => void
  ): Promise<ApiFile> {
    const effectiveFileName = fileName || (file instanceof File ? file.name : 'file');
    const mimeType = file.type || 'application/octet-stream';
    const contentMd5 = await calculateContentMd5Base64(file);

    const presignResponse = await this.getPresignedUpload(schoolPublicId, {
      fileName: effectiveFileName,
      sizeBytes: file.size,
      mimeType,
      contentMd5,
      bucketType,
    });

    await this.uploadFileDirect(
      presignResponse.uploadUrl,
      file,
      mimeType,
      contentMd5,
      onProgress
    );

    return await this.completeUpload(schoolPublicId, {
      storageKey: presignResponse.storageKey,
      fileName: effectiveFileName,
      sizeBytes: file.size,
      mimeType,
      allowedUserPublicIds,
      allowedGroupIds,
    });
  },

  async deleteFile(schoolPublicId: string, filePublicId: string): Promise<void> {
    const queryKey = [`/api/ApiFiles/${schoolPublicId}/${filePublicId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.delete<void>(queryKey[0]),
    });
    return response.data;
  },

  async uploadFileMultipart(schoolPublicId: string, file: File, allowedUserPublicIds?: string[], allowedGroupIds?: number[], bucketType?: string): Promise<ApiFile> {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('FileName', file.name);
    if (bucketType) {
      formData.append('BucketType', bucketType);
    }
    if (allowedUserPublicIds) {
      allowedUserPublicIds.forEach((id) => formData.append('AllowedUserPublicIds', id));
    }
    if (allowedGroupIds) {
      allowedGroupIds.forEach((id) => formData.append('AllowedGroupIds', id.toString()));
    }
    const response = await queryFn.post<ApiFile>(`/api/ApiFiles/${schoolPublicId}`, formData);
    return response.data;
  },

  async uploadChatFile(schoolPublicId: string, file: File): Promise<ApiFile> {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('FileName', file.name);
    const response = await queryFn.post<ApiFile>(`/api/ApiFiles/${schoolPublicId}/chat-upload`, formData);
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
