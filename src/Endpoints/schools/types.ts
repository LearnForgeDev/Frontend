export type SchoolRole = "Teacher" | "Student" | "Owner" | "Founder" | "Admin";

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

