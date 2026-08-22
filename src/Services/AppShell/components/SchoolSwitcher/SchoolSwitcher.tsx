import { useState, type MouseEvent } from 'react';
import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import type { UserSchoolInfo } from '@/Endpoints';
import { formatRoles } from '@/Assets/globalUtils';
import * as S from '../../AppShell.styles';

type SchoolSwitcherProps = {
  schools: UserSchoolInfo[];
  currentSchool?: UserSchoolInfo;
  compact?: boolean;
  onSelectSchool: (school: UserSchoolInfo) => void;
  onOpenSchoolList: () => void;
};

export default function SchoolSwitcher({
  schools,
  currentSchool,
  compact = false,
  onSelectSchool,
  onOpenSchoolList,
}: SchoolSwitcherProps) {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const closeMenu = () => setAnchorElement(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  };

  const handleSelect = (school: UserSchoolInfo) => {
    onSelectSchool(school);
    closeMenu();
  };

  const handleOpenSchoolList = () => {
    onOpenSchoolList();
    closeMenu();
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        endIcon={<ExpandMoreRoundedIcon />}
        sx={{
          ...S.schoolSwitcherSx,
          ...(compact ? { width: 'auto', minHeight: 40, px: 1.25 } : {}),
        }}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorElement)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, minWidth: 0 }}>
          <SchoolRoundedIcon fontSize="small" />
          <Box sx={{ minWidth: 0, textAlign: 'left' }}>
            <Typography sx={{ fontWeight: 800, fontSize: compact ? '0.82rem' : '0.9rem' }} noWrap>
              {currentSchool?.schoolName ?? 'Выберите школу'}
            </Typography>
            {!compact && currentSchool && (
              <Typography sx={{ color: 'var(--app-text-subtle)', fontSize: '0.72rem' }} noWrap>
                {formatRoles(currentSchool.roles)}
              </Typography>
            )}
          </Box>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorElement}
        open={Boolean(anchorElement)}
        onClose={closeMenu}
        slotProps={{ paper: { sx: { minWidth: 248, mt: 1, borderRadius: '16px' } } }}
      >
        {schools.map((school) => (
          <MenuItem key={school.schoolPublicId} onClick={() => handleSelect(school)}>
            <ListItemIcon>
              {school.schoolPublicId === currentSchool?.schoolPublicId && <CheckRoundedIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText primary={school.schoolName} secondary={formatRoles(school.roles)} />
          </MenuItem>
        ))}
        <MenuItem onClick={handleOpenSchoolList} divider={schools.length > 0}>
          <ListItemIcon><SchoolRoundedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Все школы" />
        </MenuItem>
      </Menu>
    </>
  );
}
