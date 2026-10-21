import { Box, Button, Typography } from '@mui/material';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { useLogout } from '@/Services/Auth/hooks/useLogout';
import { ONBOARDING_ACCOUNT_TEXT } from './OnboardingAccount.const';
import * as S from './OnboardingAccount.styles';

export default function OnboardingAccount() {
  const username = useGlobalContext((state) => state.auth.user?.userName);
  const logout = useLogout();
  return (
    <Box component="header" sx={S.root}>
      <Typography sx={S.username}>{username}</Typography>
      <Button onClick={logout}>{ONBOARDING_ACCOUNT_TEXT.switchAccount}</Button>
    </Box>
  );
}
