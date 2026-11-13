import type { UserIdentity } from '@/Assets/Types/commonTypes';
import type { User } from './useGlobalContext';

export type StoredUserIdentity = Partial<UserIdentity> & {
  activeSchoolPublicId?: string;
  roles?: User['roles'];
};
