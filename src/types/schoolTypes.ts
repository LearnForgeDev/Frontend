export type SchoolFileAccess = {
  allowedUserPublicIds?: string[];
  allowedGroupIds?: string[];
};

export type SchoolFileItem = {
  filePublicId: string;
  fileName: string;
  sizeBytes: number;
  mimeType: string;
  createdAt?: string;
  uploaderName?: string;
  access?: SchoolFileAccess;
};

export type DirectUploadPresignResponse = {
  uploadUrl: string;
  storageKey: string;
  headers?: Record<string, string>;
};

export type DirectUploadCompleteRequest = {
  storageKey: string;
  fileName: string;
  sizeBytes: number;
  mimeType: string;
  allowedUserPublicIds?: string[];
  allowedGroupIds?: string[];
};

export type DirectUploadPresignRequest = {
  fileName: string;
  contentMd5?: string;
};
