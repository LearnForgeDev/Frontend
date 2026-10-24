import { Avatar, Box, Button, Typography } from '@mui/material';
import { useProfileButton } from '../../hooks/useProfileButton';
import * as S from './ProfileButton.styles';

export default function ProfileButton() {
  const { userName, userInitials, openProfile } = useProfileButton();

  return (
    <Button data-testid="profile-open" aria-label="Открыть профиль" onClick={openProfile} sx={S.topbarProfileButtonSx}>
      <Avatar sx={S.avatarSx}>{userInitials}</Avatar>
      <Box sx={S.topbarProfileTextSx}>
        <Typography sx={S.profileNameSx} noWrap>{userName}</Typography>
        <Typography sx={S.profileHintSx}>Профиль</Typography>
      </Box>
    </Button>
  );
}
