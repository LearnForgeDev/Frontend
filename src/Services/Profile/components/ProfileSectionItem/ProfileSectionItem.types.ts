export type ProfileSectionItemData = {
  id: string;
  title: string;
  details?: string;
  actionLabel?: string;
  onAction?: () => void;
};
