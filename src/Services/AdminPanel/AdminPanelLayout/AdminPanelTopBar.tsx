import { useState } from 'react';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import {
  appBarSx,
  avatarSx,
  crumbsSx,
  crumbsTitleSx,
  menuButtonSx,
  toolbarSx,
  topbarIconButtonSx,
  topbarRightSx,
} from './AdminPanelLayout.styles';
import NotificationsPopover from './NotificationsPopover';
import { useGlobalContext } from '@/Storage/Context/useGlobalContext';

type AdminPanelTopBarProps = {
  isDesktop: boolean;
  pageTitle: string;
  onToggleMenu: () => void;
};

export default function AdminPanelTopBar({ isDesktop, pageTitle, onToggleMenu }: AdminPanelTopBarProps) {
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationsAnchorEl(null);
  };

  const user = useGlobalContext();
  const name = user?.auth?.user?.userName || 'default user';

  return (
    <AppBar position="fixed" elevation={0} sx={appBarSx(isDesktop)}>
      <Toolbar sx={toolbarSx(isDesktop)}>
        {!isDesktop && (
          <IconButton onClick={onToggleMenu} sx={menuButtonSx}>
            <Box component="span" className="material-symbols-outlined">menu</Box>
          </IconButton>
        )}
        <Box sx={crumbsSx}>
          <Typography component="span">Рабочее пространство</Typography>
          <Box component="span" className="material-symbols-outlined">chevron_right</Box>
          <Typography component="strong" sx={crumbsTitleSx}>
            {pageTitle}
          </Typography>
        </Box>
        <Box sx={topbarRightSx}>
          <IconButton sx={topbarIconButtonSx} aria-label="Уведомления" onClick={handleOpenNotifications}>
            <Box component="span" className="material-symbols-outlined">notifications</Box>
          </IconButton>
          <NotificationsPopover anchorEl={notificationsAnchorEl} onClose={handleCloseNotifications} />

          <IconButton sx={topbarIconButtonSx} aria-label="Настройки">
            <Box component="span" className="material-symbols-outlined">settings</Box>
          </IconButton>
          <Box sx={avatarSx}>{name.slice(0, 2)}</Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
