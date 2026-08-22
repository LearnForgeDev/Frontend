export type SchoolRole = 'Student' | 'Teacher' | 'Owner';

export interface UserSchoolInfo {
  schoolPublicId: string;
  schoolName: string;
  roles: SchoolRole[];
}

export interface MemberDto {
  userPublicId: string;
  displayName: string;
}

export interface SchoolInfo {
  publicId: string;
  name: string;
}
