import { Avatar, Box, Button, Tooltip, Typography } from '@mui/material';
import { useProfileButton } from '../../hooks/useProfileButton';
import type { ProfileButtonProps } from './ProfileButton.type';
import * as S from './ProfileButton.styles';

export default function ProfileButton({ compact = false, onNavigate }: ProfileButtonProps) {
  const { userName, userInitials, openProfile } = useProfileButton();

  return (
    <Tooltip title={compact ? 'Открыть профиль' : ''} placement="right">
      <Button data-testid="profile-open" aria-label="Открыть профиль" onClick={() => {
        openProfile();
        onNavigate?.();
      }} sx={compact ? S.compactProfileButtonSx : S.profileButtonSx}>
        <Avatar sx={S.avatarSx}>{userInitials}</Avatar>
        {!compact && <Box sx={S.profileTextSx}>
          <Typography sx={S.profileNameSx} noWrap>{userName}</Typography>
          <Typography sx={S.profileHintSx}>Профиль</Typography>
        </Box>}
      </Button>
    </Tooltip>
  );
}
