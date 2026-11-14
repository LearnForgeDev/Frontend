import type { UserIdentity } from '@/Assets/Types/commonTypes';

export type StoredSession = Pick<UserIdentity, 'refreshToken' | 'activeSchoolPublicId'>;
