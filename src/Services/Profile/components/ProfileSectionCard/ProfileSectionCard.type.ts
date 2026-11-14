import type { ReactNode } from 'react';
import type { ProfileSectionItemData } from '../ProfileSectionItem/ProfileSectionItem.type';

export type ProfileSectionCardProps = {
  title: string;
  actionLabel: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
  itemIcon: ReactNode;
  items: ProfileSectionItemData[];
  isLoading: boolean;
  isError: boolean;
  errorText: string;
  emptyText: string;
};
