import { Alert, Box, Link as MuiLink, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { AuthRole } from '../../types/commonTypes';

import * as S from './RegisterPage.styles';

import InviteTokenStep from './Components/InviteTokenStep/InviteTokenStep';
import RegisterCredentialsStep from './Components/RegisterCredentialsStep/RegisterCredentialsStep';
import SchoolNameStep from './Components/SchoolNameStep/SchoolNameStep';
import { useRegisterFlow } from './hooks/useRegisterFlow';

export default function RegisterPage() {
    const {
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
    } = useRegisterFlow();

    return (
        <Box component="form" onSubmit={handleSubmit} sx={S.formContainer}>
            <Typography variant="h5" component="h1" align="center" sx={S.title}>
                Регистрация
            </Typography>

            {step === 1 && (
                <ToggleButtonGroup
                    color="primary"
                    value={role}
                    exclusive
                    onChange={(_, newRole) => {
                        if (newRole !== null) {
                            setRole(newRole as AuthRole);
                        }
                    }}
                    aria-label="Роль"
                    sx={S.toggleGroup}
                >
                    <ToggleButton value="student" sx={S.toggleButton}>Студент</ToggleButton>
                    <ToggleButton value="teacher" sx={S.toggleButton}>Преподаватель</ToggleButton>
                </ToggleButtonGroup>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            {step === 1 ? (
                role === 'student' ? (
                    <InviteTokenStep inviteToken={inviteToken} onInviteTokenChange={handleInviteTokenChange} />
                ) : (
                    <SchoolNameStep
                        schoolName={schoolName}
                        onSchoolNameChange={(e) => setSchoolName(e.target.value)}
                    />
                )
            ) : (
                <RegisterCredentialsStep
                    name={name}
                    password={password}
                    confirmPassword={confirmPassword}
                    loading={loading}
                    onNameChange={(e) => setName(e.target.value)}
                    onPasswordChange={(e) => setPassword(e.target.value)}
                    onConfirmPasswordChange={(e) => setConfirmPassword(e.target.value)}
                    onBack={goBackToStep1}
                />
            )}

            <Typography variant="body2" align="center" sx={S.linkText}>
                Уже есть аккаунт?{' '}
                <MuiLink component={Link} to="/auth/login" underline="hover">
                    Войти
                </MuiLink>
            </Typography>
        </Box>
    );
}
