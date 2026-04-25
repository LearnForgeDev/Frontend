import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { registerFounder, registerStudent } from '../../../endpoints/apiAuth';
import type { AuthRole } from '../../../types/commonTypes';

type RegisterStep = 1 | 2;

type UseRegisterFlowResult = {
    role: AuthRole;
    setRole: (role: AuthRole) => void;
    step: RegisterStep;
    inviteToken: string;
    schoolName: string;
    name: string;
    password: string;
    confirmPassword: string;
    error: string | null;
    loading: boolean;
    handleInviteTokenChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setSchoolName: (value: string) => void;
    setName: (value: string) => void;
    setPassword: (value: string) => void;
    setConfirmPassword: (value: string) => void;
    goBackToStep1: () => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
};

export function useRegisterFlow(): UseRegisterFlowResult {
    const navigate = useNavigate();

    const [role, setRoleState] = useState<AuthRole>('student');
    const [step, setStep] = useState<RegisterStep>(1);

    const [name, setNameState] = useState('');
    const [password, setPasswordState] = useState('');
    const [confirmPassword, setConfirmPasswordState] = useState('');

    const [inviteToken, setInviteToken] = useState('');
    const [schoolName, setSchoolNameState] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const setRole = useCallback((newRole: AuthRole) => {
        setRoleState(newRole);
        setStep(1);
        setError(null);
    }, []);

    const handleInviteTokenChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
            setInviteToken(val);

            if (val.length === 6) {
                setStep(2);
                setError(null);
            }
        },
        [],
    );

    const setSchoolName = useCallback((value: string) => {
        setSchoolNameState(value);
    }, []);

    const setName = useCallback((value: string) => {
        setNameState(value);
    }, []);

    const setPassword = useCallback((value: string) => {
        setPasswordState(value);
    }, []);

    const setConfirmPassword = useCallback((value: string) => {
        setConfirmPasswordState(value);
    }, []);

    const goBackToStep1 = useCallback(() => {
        setStep(1);
    }, []);

    const canProceedFromStep1Error = useMemo(() => {
        if (role === 'student' && inviteToken.length !== 6) {
            return 'Токен приглашения должен состоять из 6 символов';
        }

        if (role === 'teacher' && !schoolName.trim()) {
            return 'Введите название школы';
        }

        return null;
    }, [inviteToken.length, role, schoolName]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);

            if (step === 1) {
                if (canProceedFromStep1Error) {
                    setError(canProceedFromStep1Error);
                    return;
                }

                setStep(2);
                return;
            }

            if (password !== confirmPassword) {
                setError('Пароли не совпадают');
                return;
            }

            setLoading(true);

            try {
                const result = await (role === 'student'
                    ? registerStudent({
                          name,
                          password,
                          confirmPassword,
                          inviteToken,
                      })
                    : registerFounder({
                          name,
                          password,
                          confirmPassword,
                      }));

                if (result.jwtToken) {
                    navigate('/Lessons');
                } else {
                    setError('Ошибка регистрации. Отсутствуют данные ответа.');
                }
            } catch {
                setError('Произошла ошибка при регистрации.');
            } finally {
                setLoading(false);
            }
        },
        [
            canProceedFromStep1Error,
            confirmPassword,
            inviteToken,
            name,
            navigate,
            password,
            role,
            step,
        ],
    );

    return {
        role,
        setRole,
        step,
        inviteToken,
        schoolName,
        name,
        password,
        confirmPassword,
        error,
        loading,
        handleInviteTokenChange,
        setSchoolName,
        setName,
        setPassword,
        setConfirmPassword,
        goBackToStep1,
        handleSubmit,
    };
}

