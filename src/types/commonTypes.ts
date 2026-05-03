import * as React from "react";

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
  color?: string;
  title?: string;
  backgroundColor?: string;
};

export type NotificationProps = {
  success?: boolean
  title?: string,
  message: string,
  durationMS?: number,
}

export type ModalTriggerProps = {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
};

export type AuthRole = 'student' | 'teacher';

export type UserIdentity = {
  jwtToken: string;
  refreshToken: string;
  userName: string;
  userPublicId: string;
};

export type PendingSchoolRequest = {
  schoolName: string;
  status: 'pending';
};
