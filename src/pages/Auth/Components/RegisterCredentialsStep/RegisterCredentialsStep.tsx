import React from 'react';
import { Button } from '@mui/material';

import LoginField from '../LoginField';
import PasswordField from '../PasswordField';
import * as S from './RegisterCredentialsStep.styles';

type RegisterCredentialsStepProps = {
    name: string;
    password: string;
    confirmPassword: string;
    loading: boolean;
    onNameChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBack: () => void;
};

export default function RegisterCredentialsStep({
    name,
    password,
    confirmPassword,
    loading,
    onNameChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onBack,
}: RegisterCredentialsStepProps) {
    return (
        <>
            <LoginField label="Имя пользователя" value={name} onChange={onNameChange} />

            <PasswordField label="Пароль" value={password} onChange={onPasswordChange} />

            <PasswordField
                label="Подтвердите пароль"
                value={confirmPassword}
                onChange={onConfirmPasswordChange}
            />

            <Button variant="outlined" onClick={onBack} sx={S.backButton}>
                Назад
            </Button>

            <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                sx={S.submitButton}
            >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
        </>
    );
}

