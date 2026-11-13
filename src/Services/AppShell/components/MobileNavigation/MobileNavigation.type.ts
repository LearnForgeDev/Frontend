import type { AppNavigationItem } from '../../AppShell.type';

export type MobileNavigationProps = {
  items: AppNavigationItem[];
  activeItemId?: string;
  onSelect: (item: AppNavigationItem) => void;
};
