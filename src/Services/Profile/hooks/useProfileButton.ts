import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { PROFILE_FALLBACK_INITIALS, PROFILE_INITIALS_LENGTH } from '../components/ProfileButton/ProfileButton.const';

export function useProfileButton() {
  const navigate = useNavigate();
  const userName = useGlobalContext((state) => state.auth.user?.userName);

  return {
    userName: userName ?? 'Профиль',
    userInitials: userName?.slice(0, PROFILE_INITIALS_LENGTH).toUpperCase() ?? PROFILE_FALLBACK_INITIALS,
    openProfile: () => navigate('/app/profile'),
  };
}
