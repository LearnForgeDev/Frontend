import type { UserIdentity } from '@/Assets/Types/commonTypes';
import type { User } from './useGlobalContext';

const USER_STORAGE_KEY = 'user_identity';

type StoredUserIdentity = Partial<UserIdentity> & {
  activeSchoolPublicId?: string;
  roles?: User['roles'];
};

const getStoredUserIdentity = (): StoredUserIdentity => {
  try {
    const storedIdentity = localStorage.getItem(USER_STORAGE_KEY);
    return storedIdentity ? JSON.parse(storedIdentity) as StoredUserIdentity : {};
  } catch {
    return {};
  }
};

export const persistActiveSchool = (user: User): void => {
  const storedIdentity = getStoredUserIdentity();

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
    ...storedIdentity,
    ...user,
    userRoles: storedIdentity.userRoles ?? user.roles,
  }));
};

export const persistUserIdentity = (
  userIdentity: UserIdentity,
  activeSchoolPublicId?: string,
): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
    ...userIdentity,
    activeSchoolPublicId,
  }));
};
