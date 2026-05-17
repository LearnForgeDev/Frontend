export type BranchDto = {
  id: number;
  name: string;
  description: string;
  publicId: string;
};

export type ChatFileDto = {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
};

export type DeletedMessagesDto = {
  count: number;
};

export type BranchModel = {
  name: string;
  description: string;
};
