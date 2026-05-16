import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import type { ServiceManifest } from '../../../types/serviceTypes.ts';
import {
  backLinkIconSx,
  backLinkSx,
  drawerContentSx,
  drawerHeaderSx,
  drawerSubtitleSx,
  drawerTitleSx,
  navFooterSx,
  navIconSx,
  navItemSx,
  navListSx,
  navSectionTitleSx,
} from './AdminPanelLayout.styles';

type AdminPanelDrawerContentProps = {
  services: ServiceManifest[];
  pathname: string;
  onCloseMenu: () => void;
};

export default function AdminPanelDrawerContent({
  services,
  pathname,
  onCloseMenu,
}: AdminPanelDrawerContentProps) {
  return (
    <Box sx={drawerContentSx}>
      <Box sx={drawerHeaderSx}>
        <Typography component="h2" sx={drawerTitleSx}>
          Admin Panel
        </Typography>
        <Typography component="p" sx={drawerSubtitleSx}>
          Обучающее пространство
        </Typography>
      </Box>

      <List sx={navListSx}>
        <Typography component="div" sx={navSectionTitleSx}>
          Platform
        </Typography>

        <ListItemButton
          component={NavLink}
          to="/admin"
          end
          onClick={onCloseMenu}
          selected={pathname === '/admin'}
          sx={navItemSx}
        >
          <ListItemIcon sx={navIconSx}>
            <Box component="span" className="material-symbols-outlined">dashboard</Box>
          </ListItemIcon>
          <ListItemText primary="Панель управления" />
        </ListItemButton>

        <ListItemButton
          component={NavLink}
          to="/admin/marketplace"
          onClick={onCloseMenu}
          selected={pathname.includes('/marketplace')}
          sx={navItemSx}
        >
          <ListItemIcon sx={navIconSx}>
            <Box component="span" className="material-symbols-outlined">storefront</Box>
          </ListItemIcon>
          <ListItemText primary="Сервисы" />
        </ListItemButton>

        <ListItemButton disabled sx={navItemSx}>
          <ListItemIcon sx={navIconSx}>
            <Box component="span" className="material-symbols-outlined">assignment</Box>
          </ListItemIcon>
          <ListItemText primary="Домашние задания" />
        </ListItemButton>

        <ListItemButton disabled sx={navItemSx}>
          <ListItemIcon sx={navIconSx}>
            <Box component="span" className="material-symbols-outlined">calendar_today</Box>
          </ListItemIcon>
          <ListItemText primary="Календарь" />
        </ListItemButton>

        <ListItemButton disabled sx={navItemSx}>
          <ListItemIcon sx={navIconSx}>
            <Box component="span" className="material-symbols-outlined">group</Box>
          </ListItemIcon>
          <ListItemText primary="Студенты" />
        </ListItemButton>

        <Typography component="div" sx={{ ...navSectionTitleSx, margin: '2rem 0 0.5rem' }}>
          Services
        </Typography>

        {services
          .filter((service) => service.isBought && service.isEnabled)
          .map((service) => {
            const isActive = pathname.includes(`/services/${service.adminRoute}`);
            return (
              <ListItemButton
                key={service.id}
                component={NavLink}
                to={`services/${service.adminRoute}`}
                onClick={onCloseMenu}
                selected={isActive}
                sx={navItemSx}
              >
                <ListItemIcon sx={navIconSx}>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      color: isActive
                        ? 'var(--admin-primary)'
                        : 'color-mix(in srgb, var(--admin-text) 60%, transparent)',
                    }}
                  >
                    {typeof service.icon === 'string' ? (
                      <Box component="span" className="material-symbols-outlined">
                        {service.icon}
                      </Box>
                    ) : (
                      service.icon
                    )}
                  </Box>
                </ListItemIcon>
                <ListItemText primary={service.name} />
              </ListItemButton>
            );
          })}
      </List>

      <Box sx={navFooterSx}>
        <ListItemButton component={NavLink} to="/" onClick={onCloseMenu} sx={backLinkSx}>
          <ListItemIcon sx={backLinkIconSx}>
            <Box component="span" className="material-symbols-outlined">arrow_back</Box>
          </ListItemIcon>
          <ListItemText primary="Return to site" />
        </ListItemButton>
      </Box>
    </Box>
  );
}

