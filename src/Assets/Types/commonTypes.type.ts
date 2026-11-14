import type { SVGProps, ReactNode } from 'react';
import type { AuthRole } from './commonTypes';

export type IconProps = SVGProps<SVGSVGElement> & {
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
  children: ReactNode;
  className?: string;
  onClose?: () => void;
};

export type UserIdentity = {
  jwtToken: string;
  refreshToken: string;
  activeSchoolPublicId?: string;
  userName: string;
  userPublicId: string;
  userRoles: Array<{ role: AuthRole; schoolId: string; userId: number }>;
  exp: number;
  email?: string;
  phone?: string;
};
