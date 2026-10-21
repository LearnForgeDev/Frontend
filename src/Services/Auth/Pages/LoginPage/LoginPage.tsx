import { createElement, useMemo } from 'react';
import { Alert, Box, Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { useAuthFlow } from '../../hooks/useAuthFlow';
import { getLoginSteps } from '../../AuthSteps';
import * as S from './LoginPage.styles';


export default function LoginPage() {
  const { name, password, error, isLoading, setField, handleSubmit, alternatePath } =
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

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={S.form}
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
        <MuiLink component={Link} to={alternatePath} underline="hover">
          Зарегистрироваться
        </MuiLink>
      </Typography>
    </Box>
  );
}
