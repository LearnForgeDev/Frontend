import { createElement, useMemo, type FormEvent } from 'react';
import { Alert, Box, Link as MuiLink, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import { useAuthFlow } from '../../contexts/AuthFlowContext';
import { getLoginSteps } from '../../AuthSteps';
import * as S from './LoginPage.styles';


export default function LoginPage() {
  const location = useLocation();
  const { name, password, error, isLoading, setField, handleSubmit } =
    useAuthFlow();

  const loginSteps = useMemo(
    () =>
      getLoginSteps({
        name,
        password,
        isLoading,
        onNameChange: (value) => setField("name", value),
        onPasswordChange: (value) => setField("password", value),
      }),
    [isLoading, name, password, setField],
  );

  const currentStep = loginSteps[0];

  const handleFormSubmit = async (event: FormEvent) => {
    await handleSubmit("login", event);
  };

  return (
    <Box
      component="form"
      onSubmit={handleFormSubmit}
      sx={S.formSx}
    >
      <Box sx={S.headingSx}>
        <Typography component="h1" sx={S.title}>С возвращением</Typography>
        <Typography sx={S.subtitle}>Войдите, чтобы продолжить работу.</Typography>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}

      {currentStep?.components.map((componentConfig) => {
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
        Нет аккаунта?{' '}
        <MuiLink component={Link} to="/auth/register" state={location.state} underline="hover">
          Зарегистрироваться
        </MuiLink>
      </Typography>
    </Box>
  );
}
