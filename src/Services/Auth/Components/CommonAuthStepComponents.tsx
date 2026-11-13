import type { AuthCredentialsStepProps } from './CommonAuthStepComponents.type';
import type { ChangeEvent } from 'react';
import { Button } from '@mui/material';

import LoginField from './LoginField';
import PasswordField from './PasswordField';
import * as S from '../AuthSteps.styles';
import { AUTH_VALIDATION_MESSAGES } from '../hooks/useAuthForm/useAuthForm.const';

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
                name="name"
                autoComplete="username"
                value={name}
                onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onNameChange(event.target.value)}
            />

            <PasswordField
                label="Пароль"
                name="password"
                autoComplete="new-password"
                helperText={AUTH_VALIDATION_MESSAGES.passwordRequirements}
                toggleTestId="auth-register-password-toggle"
                value={password}
                onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onPasswordChange(event.target.value)}
            />

            <PasswordField
                label="Подтвердите пароль"
                name="confirmPassword"
                autoComplete="new-password"
                toggleTestId="auth-register-confirmation-toggle"
                value={confirmPassword}
                onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onConfirmPasswordChange(event.target.value)}
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
