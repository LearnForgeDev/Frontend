export interface ApiFile {
  publicId: string;
  fileName: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedByUserId?: string;
  storageKey: string;
}

export interface RequestDirectUploadUrlRequest {
  fileName: string;
  sizeBytes?: number;
  mimeType?: string;
  contentMd5: string;
  bucketType?: string;
}

export interface PresignResponseDto {
  uploadUrl: string;
  storageKey: string;
}

export interface CompleteDirectUploadRequest {
  storageKey: string;
  fileName: string;
  sizeBytes?: number;
  mimeType?: string;
  allowedUserPublicIds?: string[];
  allowedGroupIds?: number[];
}

export interface UpdateFileAccessRequest {
  allowedUserPublicIds?: string[];
  allowedGroupIds?: number[];
}
