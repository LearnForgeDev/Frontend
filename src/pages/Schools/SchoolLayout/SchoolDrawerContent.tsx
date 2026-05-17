import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import {
  backLinkIconSx,
  backLinkSx,
  drawerContentSx,
  drawerHeaderSx,
  navFooterSx,
  navListSx,
} from '../../AdminPanel/AdminPanelLayout/AdminPanelLayout.styles';
import {
  schoolDrawerSectionTitleSx,
  schoolDrawerSubtitleSx,
  schoolDrawerTitleSx,
  schoolNavIconSx,
  schoolNavItemSx,
} from './SchoolLayout.styles';

type SchoolDrawerContentProps = {
  schoolPublicId: string;
  schoolName: string;
  pathname: string;
  onCloseMenu: () => void;
};

export default function SchoolDrawerContent({
  schoolPublicId,
  schoolName,
  pathname,
  onCloseMenu,
}: SchoolDrawerContentProps) {
  const basePath = `/admin/schools/${encodeURIComponent(schoolPublicId)}`;

  return (
    <Box sx={drawerContentSx}>
      <Box sx={drawerHeaderSx}>
        <Typography component="h2" sx={schoolDrawerTitleSx}>
          {schoolName}
        </Typography>
        <Typography component="p" sx={schoolDrawerSubtitleSx}>
          Школьное пространство
        </Typography>
      </Box>

      <List sx={navListSx}>
        <Typography component="div" sx={schoolDrawerSectionTitleSx}>
          Навигация
        </Typography>

        <ListItemButton
          component={NavLink}
          to={basePath}
          end
          onClick={onCloseMenu}
          selected={pathname === basePath}
          sx={schoolNavItemSx}
        >
          <ListItemIcon sx={schoolNavIconSx}>
            <Box component="span" className="material-symbols-outlined">home</Box>
          </ListItemIcon>
          <ListItemText primary="Обзор" />
        </ListItemButton>

        <ListItemButton
          component={NavLink}
          to={`${basePath}/files`}
          onClick={onCloseMenu}
          selected={pathname.includes('/files')}
          sx={schoolNavItemSx}
        >
          <ListItemIcon sx={schoolNavIconSx}>
            <Box component="span" className="material-symbols-outlined">folder</Box>
          </ListItemIcon>
          <ListItemText primary="Файлы" />
        </ListItemButton>

        <ListItemButton
          component={NavLink}
          to={`${basePath}/chats`}
          onClick={onCloseMenu}
          selected={pathname.includes('/chats')}
          sx={schoolNavItemSx}
        >
          <ListItemIcon sx={schoolNavIconSx}>
            <Box component="span" className="material-symbols-outlined">forum</Box>
          </ListItemIcon>
          <ListItemText primary="Чаты" />
        </ListItemButton>
      </List>

      <Box sx={navFooterSx}>
        <ListItemButton component={NavLink} to="/admin/schools" onClick={onCloseMenu} sx={backLinkSx}>
          <ListItemIcon sx={backLinkIconSx}>
            <Box component="span" className="material-symbols-outlined">arrow_back</Box>
          </ListItemIcon>
          <ListItemText primary="Мои школы" />
        </ListItemButton>
      </Box>
    </Box>
  );
}
