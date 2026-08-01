import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { NavLink } from 'react-router-dom';
import type { ServiceManifest } from '@/Assets/Types/serviceTypes';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { useSchools } from '@/Services/AdminPanel/SchoolsPage/hooks/useSchools';
import { formatRoles } from '@/Assets/globalUtils';
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
} from "./AdminPanelLayout.styles";

type AdminPanelDrawerContentProps = {
  services: ServiceManifest[];
  pathname: string;
  onCloseMenu: () => void;
};

export default function AdminPanelDrawerContent({
  pathname,
  onCloseMenu,
}: AdminPanelDrawerContentProps) {
  const user = useGlobalContext((s) => s.auth.user);
  const { data: schools } = useSchools();
  const activeSchool = schools?.find((s) => s.schoolPublicId === user?.activeSchoolPublicId);

  return (
    <Box sx={drawerContentSx}>
      <Box sx={drawerHeaderSx}>
        <Typography component="h2" sx={drawerTitleSx}>
          Панель управления
        </Typography>
        {activeSchool ? (
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'rgba(48, 51, 48, 0.04)', borderRadius: 2, border: '1px solid rgba(48, 51, 48, 0.06)' }}>
            <Typography 
              component="p" 
              sx={{ 
                ...drawerSubtitleSx, 
                color: 'var(--admin-text)', 
                fontWeight: 700, 
                mb: 0.5, 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                fontSize: '0.75rem',
                letterSpacing: 'normal',
                textTransform: 'none'
              }}
            >
              {activeSchool.schoolName}
            </Typography>
            <Typography component="p" sx={{ ...drawerSubtitleSx, fontSize: '0.65rem' }}>
              Роль: {formatRoles(activeSchool.roles)}
            </Typography>
          </Box>
        ) : (
          <Typography component="p" sx={drawerSubtitleSx}>
            Обучающее пространство
          </Typography>
        )}
      </Box>

      <List sx={navListSx}>
        <Typography component="div" sx={navSectionTitleSx}>
          Платформа
        </Typography>

        <ListItemButton
          component={NavLink}
          to="/admin"
          end
          onClick={onCloseMenu}
          selected={pathname === "/admin"}
          sx={navItemSx}
        >
          <ListItemIcon sx={navIconSx}>
            <Box component="span" className="material-symbols-outlined">
              dashboard
            </Box>
          </ListItemIcon>
          <ListItemText primary="Панель управления" />
        </ListItemButton>

        <ListItemButton
          component={NavLink}
          to="/admin/schools"
          onClick={onCloseMenu}
          selected={pathname.includes("/schools")}
          sx={navItemSx}
        >
          <ListItemIcon sx={navIconSx}>
            <Box component="span" className="material-symbols-outlined">
              school
            </Box>
          </ListItemIcon>
          <ListItemText primary="Мои школы" sx={{ marginTop: '20vh' }} />
        </ListItemButton>
      </List>

      <Box sx={navFooterSx}>
        <ListItemButton
          component={NavLink}
          to="/"
          onClick={onCloseMenu}
          sx={backLinkSx}
        >
          <ListItemIcon sx={backLinkIconSx}>
            <Box component="span" className="material-symbols-outlined">
              arrow_back
            </Box>
          </ListItemIcon>
          <ListItemText primary="Вернуться на сайт" />
        </ListItemButton>
      </Box>
    </Box>
  );
}