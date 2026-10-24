import type React from 'react';
import { Button } from '@mui/material';

import LoginField from './LoginField';
import PasswordField from './PasswordField';
import * as S from '../AuthSteps.styles';

type AuthCredentialsStepProps = {
    name: string;
    password: string;
    confirmPassword: string;
    isLoading: boolean;
    onNameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onConfirmPasswordChange: (value: string) => void;
};

export function AuthCredentialsStep({
    name,
    password,
    confirmPassword,
    isLoading,
    onNameChange,
    onPasswordChange,
    onConfirmPasswordChange,
}: AuthCredentialsStepProps) {
    return (
        <>
            <LoginField
                label="Имя пользователя"
                value={name}
                onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onNameChange(event.target.value)}
            />

            <PasswordField
                label="Пароль"
                toggleTestId="auth-register-password-toggle"
                value={password}
                onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onPasswordChange(event.target.value)}
            />

            <PasswordField
                label="Подтвердите пароль"
                toggleTestId="auth-register-confirmation-toggle"
                value={confirmPassword}
                onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onConfirmPasswordChange(event.target.value)}
            />

            <Button
                data-testid="auth-register-submit" type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={isLoading}
                sx={S.submitButton}
            >
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
        </>
    );
}
