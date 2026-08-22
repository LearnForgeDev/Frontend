import { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import type { AppNavigationItem } from '../../AppShell.types';
import { MORE_NAVIGATION_LABEL } from '../../AppShell.const';
import * as S from '../../AppShell.styles';

type MobileNavigationProps = {
  items: AppNavigationItem[];
  activeItemId?: string;
  onSelect: (item: AppNavigationItem) => void;
};

export default function MobileNavigation({ items, activeItemId, onSelect }: MobileNavigationProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const primaryItems = items.filter((item) => item.mobilePriority);
  const moreItems = items.filter((item) => !item.mobilePriority);
  const value = moreItems.some((item) => item.id === activeItemId) ? 'more' : activeItemId;

  const handleSelect = (item: AppNavigationItem) => {
    setIsMoreOpen(false);
    onSelect(item);
  };

  return (
    <>
      <BottomNavigation value={value ?? false} showLabels sx={S.mobileNavigationSx}>
        {primaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <BottomNavigationAction
              key={item.id}
              value={item.id}
              label={item.label}
              icon={<Icon fontSize="small" />}
              onClick={() => handleSelect(item)}
            />
          );
        })}
        <BottomNavigationAction
          value="more"
          label={MORE_NAVIGATION_LABEL}
          icon={<MoreHorizRoundedIcon fontSize="small" />}
          onClick={() => setIsMoreOpen(true)}
        />
      </BottomNavigation>

      <Drawer
        anchor="bottom"
        open={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        slotProps={{ paper: { sx: S.moreSheetSx } }}
      >
        <Typography component="h2" sx={{ px: 2, pt: 1, pb: 1.5, fontWeight: 800 }}>
          Разделы
        </Typography>
        <List>
          {moreItems.map((item) => {
            const Icon = item.icon;
            return (
              <ListItemButton
                key={item.id}
                selected={activeItemId === item.id}
                onClick={() => handleSelect(item)}
                sx={S.navigationItemSx}
              >
                <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
    </>
  );
}
