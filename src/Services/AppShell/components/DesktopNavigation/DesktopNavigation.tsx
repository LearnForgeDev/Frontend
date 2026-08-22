import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import type { AppNavigationItem } from '../../AppShell.types';
import * as S from '../../AppShell.styles';

type DesktopNavigationProps = {
  items: AppNavigationItem[];
  activeItemId?: string;
  onSelect: (item: AppNavigationItem) => void;
};

export default function DesktopNavigation({ items, activeItemId, onSelect }: DesktopNavigationProps) {
  return (
    <nav aria-label="Разделы школы">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <ListItemButton
            key={item.id}
            selected={activeItemId === item.id}
            onClick={() => onSelect(item)}
            sx={S.navigationItemSx}
          >
            <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
            <ListItemText primary={item.label} sx={{ '& .MuiListItemText-primary': { fontWeight: 700 } }} />
          </ListItemButton>
        );
      })}
    </nav>
  );
}
