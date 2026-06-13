import { AppBar, Box, IconButton, InputAdornment, TextField, Toolbar, Typography } from '@mui/material';
import {
  appBarSx,
  avatarSx,
  crumbsSx,
  crumbsTitleSx,
  menuButtonSx,
  searchFieldSx,
  toolbarSx,
  topbarIconButtonSx,
  topbarRightSx,
} from './AdminPanelLayout.styles';

type AdminPanelTopBarProps = {
  isDesktop: boolean;
  pageTitle: string;
  onToggleMenu: () => void;
};

export default function AdminPanelTopBar({ isDesktop, pageTitle, onToggleMenu }: AdminPanelTopBarProps) {
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
          {isDesktop && (
            <TextField
              size="small"
              placeholder="Поиск модулей..."
              variant="outlined"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" className="material-symbols-outlined">search</Box>
                    </InputAdornment>
                  ),
                },
              }}
              sx={searchFieldSx}
            />
          )}
          <IconButton sx={topbarIconButtonSx} aria-label="Notifications">
            <Box component="span" className="material-symbols-outlined">notifications</Box>
          </IconButton>
          <IconButton sx={topbarIconButtonSx} aria-label="Settings">
            <Box component="span" className="material-symbols-outlined">settings</Box>
          </IconButton>
          <Box sx={avatarSx}>AT</Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

