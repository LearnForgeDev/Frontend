export interface StudentDto {
  publicId?: string;
  userPublicId?: string;
  name?: string;
  userName?: string;
  fullName?: string;
  displayName?: string;
  studentName?: string;
  user?: {
    name?: string;
    userName?: string;
    fullName?: string;
  };
  email?: string;
  groupNames?: string[];
  [key: string]: unknown;
}

export interface SimpleStudentDto {
  publicId?: string;
  userPublicId?: string;
  name?: string;
  userName?: string;
  fullName?: string;
  displayName?: string;
  studentName?: string;
  user?: {
    name?: string;
    userName?: string;
    fullName?: string;
  };
}

export interface StudentGroupDto {
  id: number;
  name: string;
  description?: string;
}
