export interface Branch {
  id: number;
  name: string;
  description: string;
}

export interface BranchFile {
  id: number;
  name: string;
  url: string;
  uploadedAt: string;
}

export interface BranchModel {
  name: string | null;
  description: string | null;
  schoolPublicId: string | null;
}

export interface UpdateBranchRequest {
  name: string | null;
  description: string | null;
}
