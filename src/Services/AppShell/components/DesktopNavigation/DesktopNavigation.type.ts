import type { AppNavigationItem } from '../../AppShell.type';

export type DesktopNavigationProps = {
  items: AppNavigationItem[];
  activeItemId?: string;
  collapsed?: boolean;
  onSelect: (item: AppNavigationItem) => void;
};
