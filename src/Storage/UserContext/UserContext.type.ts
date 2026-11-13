import type { UserIdentity } from '@/Assets/Types/commonTypes';

export type UserContextValue = {
    user: UserIdentity | null;
    setUser: (user: UserIdentity) => void;
    clearUser: () => void;
    isRestoring: boolean;
    isRestoreError: boolean;
    retryRestore: () => void;
};
