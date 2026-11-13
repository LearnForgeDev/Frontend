import type { ReactNode } from 'react';

export type ProfileSectionHeaderProps = {
  title: string;
  actionLabel: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
};
