import { createContext, useCallback, useContext, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { login, registerFounder, registerStudent, requestSchool } from '../../../endpoints/apiAuth';
import { sanitizeInviteToken } from '../utils';
import type { AuthRole, UserIdentity } from '../../../types/commonTypes';
import { useUser } from '../../../contexts/UserContext';
import { usePendingSchoolRequest } from '../../../hooks/usePendingSchoolRequest';

type AuthFormState = {
    role: AuthRole;
    name: string;
    password: string;
    confirmPassword: string;
    inviteToken: string;
    schoolName: string;
};

type AuthMode = 'login' | 'register';

type AuthFlowContextValue = {
    role: AuthRole;
    name: string;
    password: string;
    confirmPassword: string;
    inviteToken: string;
    schoolName: string;
    pendingSchoolName: string;
    hasPendingSchoolRequest: boolean;
    error: string | null;
    isLoading: boolean;
    setRole: (role: AuthRole) => void;
    setField: (field: keyof AuthFormState, value: string) => void;
    clearPendingSchoolRequest: () => void;
    handleSubmit: (mode: AuthMode, event: FormEvent) => Promise<void>;
};

const AuthFlowContext = createContext<AuthFlowContextValue | undefined>(undefined);

function getInitialAuthState(): AuthFormState {
    return {
        role: 'student',
        name: '',
        password: '',
        confirmPassword: '',
        inviteToken: '',
        schoolName: '',
    };
}

function toUserIdentity(result: Partial<UserIdentity>): UserIdentity | null {
    if (!result.jwtToken || !result.refreshToken || !result.userName || !result.userPublicId) {
        return null;
    }

    return {
        jwtToken: result.jwtToken,
        refreshToken: result.refreshToken,
        userName: result.userName,
        userPublicId: result.userPublicId,
    };
}

export function AuthFlowProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const { setUser } = useUser();
    const {
        pendingSchoolName,
        hasPendingSchoolRequest,
        savePendingSchoolRequest,
        clearPendingSchoolRequest,
    } = usePendingSchoolRequest();
    const [authState, setAuthState] = useState<AuthFormState>(() => getInitialAuthState());
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const setRole = useCallback((role: AuthRole) => {
        setAuthState((previousState) => ({
            ...previousState,
            role,
        }));
        setError(null);
    }, []);

    const setField = useCallback((field: keyof AuthFormState, value: string) => {
        const nextValue = field === 'inviteToken' ? sanitizeInviteToken(value) : value;
        setAuthState((previousState) => ({
            ...previousState,
            [field]: nextValue,
        }));
    }, []);

    const handleSubmit = useCallback(async (mode: AuthMode, event: FormEvent) => {
        event.preventDefault();
        setError(null);

        if (mode === 'register' && authState.password !== authState.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setIsLoading(true);

        try {
            if (mode === 'login') {
                const result = await login({ name: authState.name, password: authState.password }) as Partial<UserIdentity>;
                const userIdentity = toUserIdentity(result);

                if (!userIdentity) {
                    setError('Ошибка входа. Пожалуйста, проверьте ваши данные.');
                    return;
                }

                setUser(userIdentity);
                navigate('/admin');
                return;
            }

            if (authState.role === 'student') {
                const result = await registerStudent({
                    name: authState.name,
                    password: authState.password,
                    confirmPassword: authState.confirmPassword,
                    inviteToken: authState.inviteToken,
                }) as Partial<UserIdentity>;

                const userIdentity = toUserIdentity(result);
                if (userIdentity) {
                    setUser(userIdentity);
                }
            } else {
                const result = await registerFounder({
                    name: authState.name,
                    password: authState.password,
                    confirmPassword: authState.confirmPassword,
                }) as Partial<UserIdentity>;

                const userIdentity = toUserIdentity(result);
                if (userIdentity) {
                    setUser(userIdentity);
                }

                const schoolName = authState.schoolName.trim();
                if (!schoolName) {
                    return;
                }

                await requestSchool({ schoolName });
                savePendingSchoolRequest(schoolName);
            }

            navigate('/admin');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        } finally {
            setIsLoading(false);
        }
    }, [authState, navigate, savePendingSchoolRequest, setUser]);

    const value = useMemo<AuthFlowContextValue>(
        () => ({
            role: authState.role,
            name: authState.name,
            password: authState.password,
            confirmPassword: authState.confirmPassword,
            inviteToken: authState.inviteToken,
            schoolName: authState.schoolName,
            pendingSchoolName,
            hasPendingSchoolRequest,
            error,
            isLoading,
            setRole,
            setField,
            clearPendingSchoolRequest,
            handleSubmit,
        }),
        [authState, clearPendingSchoolRequest, error, handleSubmit, hasPendingSchoolRequest, isLoading, pendingSchoolName, setField, setRole],
    );

    return <AuthFlowContext.Provider value={value}>{children}</AuthFlowContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthFlow(): AuthFlowContextValue {
    const context = useContext(AuthFlowContext);

    if (!context) {
        throw new Error('useAuthFlow must be used within an AuthFlowProvider');
    }

    return context;
}
