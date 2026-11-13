import { useLocation, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { useSchoolSelection } from '@/Services/Schools/hooks/useSchoolSelection';
import { PROFILE_FALLBACK_INITIALS, PROFILE_INITIALS_LENGTH } from '../components/ProfileButton/ProfileButton.const';

export function useProfileButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = useGlobalContext((state) => state.auth.user?.userName);
  const { rememberCurrentSchool } = useSchoolSelection();

  const openProfile = () => {
    if (location.pathname === '/app/profile') {
      return;
    }
    rememberCurrentSchool();
    navigate('/app/profile', { state: { profileReturnTo: `${location.pathname}${location.search}${location.hash}` } });
  };

  return {
    userName: userName ?? 'Профиль',
    userInitials: userName?.slice(0, PROFILE_INITIALS_LENGTH).toUpperCase() ?? PROFILE_FALLBACK_INITIALS,
    openProfile,
  };
}
