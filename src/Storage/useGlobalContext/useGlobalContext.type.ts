import type { UserIdentity } from '@/Assets/Types/commonTypes.ts';

export interface User {
    userPublicId: string;
    userName: string;
    roles: UserIdentity['userRoles'];
    activeSchoolPublicId?: string;
    email?: string;
    phone?: string;
}

export interface AuthSlice {
    user: User | null;
    isAuthenticated: boolean;
    jwtExpiresAt: number | null;
    setActiveSchoolPublicId: (schoolPublicId: string) => void;
    setUser: (userIdentity: UserIdentity) => void;
    logout: () => void;
}

export interface GlobalState {
    auth: AuthSlice;
}
