import type { DesktopNavigationProps } from './DesktopNavigation.type';
import { ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { APP_DESKTOP_NAVIGATION_ID } from '../../AppShell.const';

import * as S from '../../AppShell.styles';

export default function DesktopNavigation({ items, activeItemId, collapsed = false, onSelect }: DesktopNavigationProps) {
  return (
    <nav id={APP_DESKTOP_NAVIGATION_ID} aria-label="Разделы школы">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Tooltip key={item.id} title={collapsed ? item.label : ''} placement="right">
            <ListItemButton
              data-testid={`nav-desktop-${item.id}`}
              aria-label={item.label}
              selected={activeItemId === item.id}
              onClick={() => onSelect(item)}
              sx={collapsed ? S.collapsedNavigationItemSx : S.navigationItemSx}
            >
              <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
              {!collapsed && <ListItemText primary={item.label} sx={S.navigationLabelSx} />}
            </ListItemButton>
          </Tooltip>
        );
      })}
    </nav>
  );
}
