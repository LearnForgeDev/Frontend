import { Box, Typography, Avatar, Button, Stack } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { ContactItem } from './ContactItem';
import { PROFILE_CARD_TEXT } from './ProfileCard.const';

import {
  profileCardSx,
  avatarSx,
  userNameSx,
  userInfoStackSx,
  contactIconSx,
  logoutButtonSx,
} from './ProfileCard.styles';

export interface ProfileCardProps {
  user: {
    userName: string;
    email?: string;
    phone?: string;
  };
  onLogout: () => void;
}

export const ProfileCard = ({ user, onLogout }: ProfileCardProps) => {
  return (
    <Box sx={profileCardSx}>
      <Avatar sx={avatarSx}>{user.userName.slice(0, 2).toUpperCase()}</Avatar>

      <Box sx={userInfoStackSx}>
        <Typography variant="h4" sx={userNameSx}>
          {user.userName}
        </Typography>

        <Stack>
          {user.email && (
            <ContactItem
              icon={<EmailIcon sx={contactIconSx} />}
              text={user.email}
            />
          )}
          {user.phone && (
            <ContactItem
              icon={<PhoneIcon sx={contactIconSx} />}
              text={user.phone}
            />
          )}
        </Stack>
      </Box>

      <Button
        variant="outlined"
        startIcon={<LogoutIcon />}
        onClick={onLogout}
        sx={logoutButtonSx}
      >
        {PROFILE_CARD_TEXT.logout}
      </Button>
    </Box>
  );
};
