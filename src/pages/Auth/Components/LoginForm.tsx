import React, { useState } from 'react';
import { Alert, Box, Button, Link as MuiLink, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

import { login } from '../../../endpoints/apiAuth';
import LoginField from './LoginField';
import PasswordField from './PasswordField';
import * as S from '../LoginPage.styles';

type LoginFormProps = {
    title: string;
    nameLabel: string;
};

export default function LoginForm({ title, nameLabel }: LoginFormProps) {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login({ name, password });

            if (result.jwtToken || result.accessToken || result) {
                navigate('/Lessons');
            } else {
                setError('Ошибка входа. Пожалуйста, проверьте ваши данные.');
            }
        } catch {
            setError('Произошла ошибка при входе.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleLogin} sx={S.formContainer}>
            <Typography variant="h5" component="h1" align="center" sx={S.title}>
                {title}
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <LoginField
                label={nameLabel}
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <PasswordField
                label="Пароль"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setPassword(e.target.value)}
            />

            <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                sx={S.submitButton}
            >
                {loading ? 'Вход...' : 'Войти'}
            </Button>

            <Typography variant="body2" align="center" sx={S.linkText}>
                Нет аккаунта?{' '}
                <MuiLink component={Link} to="/auth/register" underline="hover">
                    Зарегистрироваться
                </MuiLink>
            </Typography>
        </Box>
    );
}

