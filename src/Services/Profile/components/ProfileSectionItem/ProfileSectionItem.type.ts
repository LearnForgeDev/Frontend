import type { ReactNode } from 'react';

export type ProfileSectionItemProps = Omit<ProfileSectionItemData, 'id'> & {
  icon: ReactNode;
  empty?: boolean;
};
export type ProfileSectionItemData = {
  id: string;
  title: string;
  details?: string;
  actionLabel?: string;
  onAction?: () => void;
};
