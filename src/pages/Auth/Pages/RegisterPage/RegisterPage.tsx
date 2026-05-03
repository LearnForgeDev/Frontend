import { Alert, Box, Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { createElement, useMemo, useState, type FormEvent } from 'react';

import * as S from './RegisterPage.styles';

import { getRegisterSteps } from '../../AuthSteps';
import { useAuthFlow } from '../../contexts/AuthFlowContext';

function RegisterPageContent() {
    const {
        role,
        name,
        password,
        confirmPassword,
        inviteToken,
        schoolName,
        error,
        isLoading,
        setRole,
        setField,
        handleSubmit,
    } = useAuthFlow();

    const formData = useMemo(() => ({
        inviteToken,
        schoolName,
        name,
        password,
        confirmPassword,
    }), [confirmPassword, inviteToken, name, password, schoolName]);

    const [stepIndex, setStepIndex] = useState<number>(0);
    const [stepError, setStepError] = useState<string | null>(null);

    const registerSteps = useMemo(() => getRegisterSteps({
        role,
        formData,
        isLoading,
        roleToggleSx: S.toggleGroup,
        onRoleChange: (newRole) => {
            setRole(newRole);
            setStepError(null);
        },
        onInviteTokenChange: (value) => {
            setStepError(null);
            setField('inviteToken', value);
        },
        onSchoolNameChange: (value) => {
            setStepError(null);
            setField('schoolName', value);
        },
        onNameChange: (value) => setField('name', value),
        onPasswordChange: (value) => setField('password', value),
        onConfirmPasswordChange: (value) => setField('confirmPassword', value),
        onBack: () => {
            setStepError(null);
            setStepIndex((currentIndex) => Math.max(0, currentIndex - 1));
        },
    }), [formData, isLoading, role, setRole, setField]);

    const currentStep = registerSteps[stepIndex];
    const isLastStep = stepIndex >= registerSteps.length - 1;

    const handleNextStep = () => {
        if (role === 'student' && formData.inviteToken.length !== 6) {
            setStepError('Введите корректный инвайт-токен (6 символов)');
            return;
        }

        if (role === 'teacher' && formData.schoolName.trim().length === 0) {
            setStepError('Введите название школы');
            return;
        }

        setStepError(null);
        setStepIndex((currentIndex) => Math.min(currentIndex + 1, registerSteps.length - 1));
    };

    const handleFormSubmit = async (event: FormEvent) => {
        if (!isLastStep) {
            event.preventDefault();
            handleNextStep();
            return;
        }

        await handleSubmit('register', event);
    };

    const visibleComponents = currentStep?.components.filter(
        (componentConfig) => !componentConfig.roles || componentConfig.roles.includes(role),
    ) ?? [];

    return (
        <Box component="form" onSubmit={handleFormSubmit} sx={S.formContainer}>
            <Typography variant="h5" component="h1" align="center" sx={S.title}>
                {currentStep?.title ?? 'Регистрация'}
            </Typography>

            {stepError && <Alert severity="error">{stepError}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            {visibleComponents.map((componentConfig) => {
                const componentProps = {
                    ...(componentConfig.props ?? {}),
                    ...(componentConfig.value !== undefined ? { value: componentConfig.value } : {}),
                    ...(componentConfig.onChangeOnValue ? { onChange: componentConfig.onChangeOnValue } : {}),
                };

                return createElement(componentConfig.component, {
                    key: componentConfig.componentKey,
                    ...componentProps,
                });
            })}

            <Typography variant="body2" align="center" sx={S.linkText}>
                Уже есть аккаунт?{' '}
                <MuiLink component={Link} to="/auth/login" underline="hover">
                    Войти
                </MuiLink>
            </Typography>
        </Box>
    );
}

export default function RegisterPage() {
    return <RegisterPageContent />;
}
