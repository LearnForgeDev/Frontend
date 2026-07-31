import React, { useRef, useState } from 'react';
import { Box, Typography, Avatar, Button, IconButton, Stack } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import { formatRoles, shortenString } from '@/Assets/globalUtils';
import { ContactItem } from './ContactItem';

import {
  profileCardSx,
  avatarContainerSx,
  avatarSx,
  avatarOverlaySx,
  hiddenInputSx,
  userNameSx,
  userInfoStackSx,
  contactIconSx,

  logoutButtonSx,
  adminButtonSx,
  buttonsContainerSx,
} from './ProfileCard.styles';

export interface ProfileCardProps {
  user: {
    userName: string;
    email?: string;
    phone?: string;
  };
  activeSchool?: {
    schoolName: string;
    roles: string[];
  };
  onLogout: () => void;
  onAdminPanel: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, activeSchool, onLogout, onAdminPanel }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  return (
    <Box sx={profileCardSx}>
      <Box sx={avatarContainerSx}>
        <Avatar sx={avatarSx} src={avatarUrl || undefined}>
          {!avatarUrl && user.userName.slice(0, 2).toUpperCase()}
        </Avatar>
        <IconButton
          className="avatar-overlay"
          sx={avatarOverlaySx}
          onClick={handleAvatarClick}
          size="small"
        >
          <CameraAltIcon fontSize="small" />
        </IconButton>
        <Box
          component="input"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          sx={hiddenInputSx}
        />
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" sx={userNameSx}>
          {user.userName}
        </Typography>

        <Stack sx={userInfoStackSx}>
          <ContactItem 
            icon={<EmailIcon sx={contactIconSx} />} 
            text={user.email || 'Email не указан'} 
          />
          <ContactItem 
            icon={<PhoneIcon sx={contactIconSx} />} 
            text={user.phone || 'Телефон не указан'} 
          />
          {activeSchool && (
            <>
              <ContactItem 
                icon={<SchoolIcon sx={contactIconSx} />} 
                text={shortenString(activeSchool.schoolName, 25)} 
              />
              <ContactItem 
                icon={<GroupIcon sx={contactIconSx} />} 
                text={formatRoles(activeSchool.roles)} 
              />
            </>
          )}
        </Stack>
      </Box>

      <Box sx={buttonsContainerSx}>
        <Button
          variant="outlined"
          startIcon={<AdminPanelSettingsIcon />}
          onClick={onAdminPanel}
          disableElevation
          sx={adminButtonSx}
        >
          Панель управления
        </Button>
        <Button
          variant="contained"
          startIcon={<LogoutIcon />}
          onClick={onLogout}
          disableElevation
          sx={logoutButtonSx}
        >
          Выйти
        </Button>
      </Box>
    </Box>
  );
};
