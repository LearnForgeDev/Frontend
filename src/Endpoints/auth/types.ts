export type LoginParams = {
  name: string;
  password: string;
};

export type RegisterParams = LoginParams & {
  confirmPassword: string;
};

export type RequestSchoolParams = {
  schoolName: string;
};

export type RefreshTokenParams = {
  refreshToken: string;
};

export type InviteParams = {
  schoolPublicId: string;
  role: number;
  maxUses?: number;
  expiresInMinutes?: number;
};

export type JoinSchoolByInviteParams = {
  inviteToken: string;
};

export type SchoolRequestStatusDto = {
  requestPublicId: string;
  status: string;
  schoolName?: string;
  requestedAt?: string;
};
