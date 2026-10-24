import { useState, type MouseEvent } from 'react';
import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import type { UserSchoolInfo } from '@/Endpoints';
import { formatRoles } from '@/Assets/globalUtils';
import { ALL_SCHOOLS_LABEL, SELECT_SCHOOL_LABEL } from './SchoolSwitcher.const';
import * as S from './SchoolSwitcher.styles';

type SchoolSwitcherProps = {
  schools: UserSchoolInfo[];
  currentSchool?: UserSchoolInfo;
  compact?: boolean;
  iconOnly?: boolean;
  onSelectSchool: (school: UserSchoolInfo) => void;
  onOpenSchoolList: () => void;
};

export default function SchoolSwitcher({
  schools,
  currentSchool,
  compact = false,
  iconOnly = false,
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
      <Tooltip title={iconOnly ? currentSchool?.schoolName ?? SELECT_SCHOOL_LABEL : ''} placement="right">
        <Button
          onClick={handleOpen}
          endIcon={iconOnly ? undefined : <ExpandMoreRoundedIcon />}
          sx={iconOnly ? S.iconSwitcherSx : compact ? S.compactSwitcherSx : S.switcherSx}
          aria-label={iconOnly ? currentSchool?.schoolName ?? SELECT_SCHOOL_LABEL : undefined}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchorElement)}
        >
          <Box sx={S.titleRowSx}>
            <SchoolRoundedIcon fontSize="small" />
            {!iconOnly && (
              <Box sx={S.textSx}>
                <Typography sx={compact ? S.compactTitleSx : S.titleSx} noWrap>
                  {currentSchool?.schoolName ?? SELECT_SCHOOL_LABEL}
                </Typography>
                {!compact && currentSchool && (
                  <Typography sx={S.subtitleSx} noWrap>
                    {formatRoles(currentSchool.roles)}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorElement}
        open={Boolean(anchorElement)}
        onClose={closeMenu}
        slotProps={{ paper: { sx: S.menuPaperSx } }}
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
          <ListItemText primary={ALL_SCHOOLS_LABEL} />
        </MenuItem>
      </Menu>
    </>
  );
}
