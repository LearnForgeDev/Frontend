import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppBar, Box, IconButton, Toolbar, Typography, Badge } from '@mui/material';
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
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';

type AdminPanelTopBarProps = {
  isDesktop: boolean;
  pageTitle: string;
  onToggleMenu: () => void;
};

export default function AdminPanelTopBar({ isDesktop, pageTitle, onToggleMenu }: AdminPanelTopBarProps) {
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<HTMLElement | null>(null);
  const notifications = useGlobalNotificationStore((state) => state.notifications);

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationsAnchorEl(null);
  };

  const navigate = useNavigate();
  const { schoolPublicId } = useParams();

  const handleSettingsClick = () => {
    if (schoolPublicId) {
      navigate(`/admin/schools/${schoolPublicId}/settings`);
    }
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
            <Badge badgeContent={notifications.length} color="error">
              <Box component="span" className="material-symbols-outlined">notifications</Box>
            </Badge>
          </IconButton>
          <NotificationsPopover anchorEl={notificationsAnchorEl} onClose={handleCloseNotifications} />

          <IconButton sx={topbarIconButtonSx} aria-label="Настройки" onClick={handleSettingsClick}>
            <Box component="span" className="material-symbols-outlined">settings</Box>
          </IconButton>
          <Box
            sx={{ ...avatarSx, cursor: 'pointer', transition: 'opacity 0.2s', '&:hover': { opacity: 0.8 } }}
            onClick={() => navigate('/profile')}
          >
            {name.slice(0, 2)}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
