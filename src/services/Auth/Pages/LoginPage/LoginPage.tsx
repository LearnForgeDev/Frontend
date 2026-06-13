import { createElement, useMemo, useEffect, type FormEvent } from 'react';
import { Alert, Box, Link as MuiLink, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

import { useAuthFlow } from '../../contexts/AuthFlowContext';
import { useUser, USER_STORAGE_KEY } from '@/Storage/Context/UserContext';
import { refreshToken } from '@/Endpoints/apiAuth';

import { getLoginSteps } from '../../AuthSteps';
import * as S from './LoginPage.styles';

function LoginPageContent() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { name, password, error, isLoading, setField, handleSubmit } =
    useAuthFlow();

  useEffect(() => {
    const checkAndRefresh = async () => {
      try {
        const storedStr = localStorage.getItem(USER_STORAGE_KEY);
        if (!storedStr) return;
        
        const storedUser = JSON.parse(storedStr);
        if (storedUser?.refreshToken) {
          const result = await refreshToken({ refreshToken: storedUser.refreshToken });
          if (result) {
            setUser({ ...storedUser, ...result });
            navigate("/admin", { replace: true });
          }
        }
      } catch (err) {
        console.error("Auto-refresh failed", err);
      }
    };
    checkAndRefresh();
  }, [navigate, setUser]);

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
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
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
        Нет аккаунта?{" "}
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
