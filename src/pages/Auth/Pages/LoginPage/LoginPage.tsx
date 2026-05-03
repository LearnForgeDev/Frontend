import { createElement, useMemo, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { useAuthFlow } from '../../contexts/AuthFlowContext';

import { getLoginSteps } from '../../AuthSteps';
import * as S from './LoginPage.styles';

const roleEnToRu = new Map([
    ['student', 'студента'],
    ['teacher', 'учителя'],
]);

function LoginPageContent() {
    const {
        role,
        name,
        password,
        error,
        isLoading,
        setRole,
        setField,
        handleSubmit,
    } = useAuthFlow();

    const [stepIndex, setStepIndex] = useState<number>(0);

    const loginSteps = useMemo(() => getLoginSteps({
        role,
        onRoleChange: setRole,
        nameLabel: `Имя ${roleEnToRu.get(role)}`,
        name,
        password,
        isLoading,
        onNameChange: (value) => setField('name', value),
        onPasswordChange: (value) => setField('password', value),
        roleToggleSx: S.toggleGroup,
    }), [isLoading, name, password, role, setField, setRole]);

    const currentStep = loginSteps[stepIndex];
    const isLastStep = stepIndex >= loginSteps.length - 1;

    const handleNextStep = () => {
        setStepIndex((prevStep) => Math.min(prevStep + 1, loginSteps.length - 1));
    };

    const handlePrevStep = () => {
        setStepIndex((prevStep) => Math.max(prevStep - 1, 0));
    };

    const handleFormSubmit = async (event: FormEvent) => {
        if (!isLastStep) {
            event.preventDefault();
            handleNextStep();
            return;
        }

        await handleSubmit('login', event);
    };

    return (
        <Box component="form" onSubmit={handleFormSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {currentStep?.components.map((componentConfig) => {
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

            {!isLastStep && (
                <Button type="button" variant="contained" fullWidth onClick={handleNextStep} sx={S.submitButton}>
                    Далее
                </Button>
            )}

            {isLastStep && (
                <Button type="button" variant="outlined" fullWidth onClick={handlePrevStep} sx={S.backButton}>
                    Назад
                </Button>
            )}

            <Typography variant="body2" align="center" sx={S.linkText}>
                Нет аккаунта?{' '}
                <MuiLink component={Link} to="/auth/register" underline="hover">
                    Зарегистрироваться
                </MuiLink>
            </Typography>
        </Box>
    );
}

export default function LoginPage() {
    return <LoginPageContent />;
}
