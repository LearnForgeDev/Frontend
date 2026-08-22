import { Alert, Box, Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { createElement, useMemo, type FormEvent } from 'react';

import * as S from './RegisterPage.styles';

import { getRegisterSteps } from '../../AuthSteps';
import { useAuthFlow } from '../../contexts/AuthFlowContext';

function RegisterPageContent() {
  const {
    name,
    password,
    confirmPassword,
    error,
    isLoading,
    setField,
    handleSubmit,
  } = useAuthFlow();

  const formData = useMemo(
    () => ({
      name,
      password,
      confirmPassword,
    }),
    [confirmPassword, name, password],
  );

  const registerSteps = useMemo(
    () =>
      getRegisterSteps({
        formData,
        isLoading,
        onNameChange: (value) => setField("name", value),
        onPasswordChange: (value) => setField("password", value),
        onConfirmPasswordChange: (value) => setField("confirmPassword", value),
      }),
    [formData, isLoading, setField],
  );

  const currentStep = registerSteps[0];

  const handleFormSubmit = async (event: FormEvent) => {
    await handleSubmit("register", event);
  };

  const visibleComponents = currentStep?.components ?? [];

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={S.formContainer}>
      <Typography variant="h5" component="h1" align="center" sx={S.title}>
        {currentStep?.title ?? "Регистрация"}
      </Typography>
      <Typography align="center" sx={S.subtitle}>
        Создайте аккаунт — школу можно выбрать после регистрации.
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {visibleComponents.map((componentConfig) => {
        const componentProps = {
          ...(componentConfig.props ?? {}),
          ...(componentConfig.value !== undefined
            ? { value: componentConfig.value }
            : {}),
          ...(componentConfig.onChangeOnValue
            ? { onChange: componentConfig.onChangeOnValue }
            : {}),
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
