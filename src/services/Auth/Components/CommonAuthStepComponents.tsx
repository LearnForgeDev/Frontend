import type React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

import LoginField from './LoginField';
import PasswordField from './PasswordField';
import * as S from '../AuthSteps.styles';

type InviteTokenInputProps = {
    value: string;
    onChange: (value: string) => void;
    length: number;
};

export function InviteTokenInput({ value, onChange, length }: InviteTokenInputProps) {
    return (
        <>
            <Box sx={S.pillInputWrapper}>
                <TextField
                    variant="outlined"
                    value={value}
                    onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value)}
                    required
                    fullWidth
                    autoFocus
                    slotProps={{
                        htmlInput: {
                            maxLength: length,
                        },
                    }}
                    sx={S.hideNativeInput}
                />

                <Box sx={S.slotsContainer}>
                    {Array.from({ length }).map((_, index) => (
                        <Box key={index} sx={S.getSlotBoxStyle(value.length === index, !!value[index])}>
                            <Typography variant="h5" sx={S.slotText}>
                                {value[index] || ''}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={S.pillButton}>
                Далее
            </Button>
        </>
    );
}

type AuthTextStepProps = {
    value: string;
    onChange: (value: string) => void;
    label: string;
};

export function AuthTextStep({ value, onChange, label }: AuthTextStepProps) {
    return (
        <>
            <TextField
                label={label}
                variant="outlined"
                value={value}
                onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value)}
                required
                fullWidth
                autoFocus
                sx={S.schoolInput}
            />

            <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={S.pillButton}>
                Далее
            </Button>
        </>
    );
}

type AuthCredentialsStepProps = {
    name: string;
    password: string;
    confirmPassword: string;
    isLoading: boolean;
    onNameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onConfirmPasswordChange: (value: string) => void;
    onBack: () => void;
};

export function AuthCredentialsStep({
    name,
    password,
    confirmPassword,
    isLoading,
    onNameChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onBack,
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
                value={password}
                onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onPasswordChange(event.target.value)}
            />

            <PasswordField
                label="Подтвердите пароль"
                value={confirmPassword}
                onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onConfirmPasswordChange(event.target.value)}
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
                disabled={isLoading}
                sx={S.submitButton}
            >
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
        </>
    );
}
