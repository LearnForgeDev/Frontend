import * as React from 'react';

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
  color?: string;
  title?: string;
  backgroundColor?: string;
};

export type NotificationProps = {
  success?: boolean;
  title?: string;
  message: string;
  durationMS?: number;
};

export type ModalTriggerProps = {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
};

export const AuthRole = {
  STUDENT: 0,
  TEACHER: 1,
  OWNER: 2,
} as const;

export type AuthRole = (typeof AuthRole)[keyof typeof AuthRole];

export type UserIdentity = {
  jwtToken: string;
  refreshToken: string;
  userName: string;
  userPublicId: string;
  userRoles: Array<{ role: AuthRole; schoolId: number; userId: number }>;
  exp: number;
};
