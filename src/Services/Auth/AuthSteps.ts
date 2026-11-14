import type { RegisterSteps, LoginSteps, RegisterStepsOptions, LoginStepsOptions } from './AuthSteps.type';
export type { RegisterFormData, RegisterFormFieldName, LoginFormFieldName, AuthStepComponent, AuthFlowStep, RegisterFlowStep, LoginFlowStep, RegisterSteps, LoginSteps } from './AuthSteps.type';
import type { ChangeEvent } from 'react';
import { Button } from '@mui/material';

import { AuthCredentialsStep } from './Components/CommonAuthStepComponents.tsx';
import LoginField from './Components/LoginField';
import PasswordField from './Components/PasswordField';

export function getLoginSteps({
  name,
  password,
  isLoading,
  onNameChange,
  onPasswordChange,
  onSubmit,
}: LoginStepsOptions): LoginSteps {
  return [
    {
      title: "С возвращением",
      components: [
        {
          formFieldName: "credentials",
          componentKey: "login-name-field",
          component: LoginField,
          props: {
            label: "Имя",
            name: "name",
            autoComplete: "username",
            value: name,
            onChange: (
              event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => onNameChange(event.target.value),
            autoFocus: true,
          },
        },
        {
          formFieldName: "credentials",
          componentKey: "login-password-field",
          component: PasswordField,
          props: {
            label: "Пароль",
            name: "password",
            autoComplete: "current-password",
            value: password,
            onChange: (
              event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => onPasswordChange(event.target.value),
          },
        },
        {
          formFieldName: "credentials",
          componentKey: "login-submit-button",
          component: Button,
          props: {
            type: "button",
            onClick: onSubmit,
            "data-testid": "auth-login-submit",
            variant: "contained",
            color: "primary",
            size: "large",
            fullWidth: true,
            disabled: isLoading,
            children: isLoading ? "Вход..." : "Войти",
          },
        },
      ],
    },
  ];
}

export function getRegisterSteps({
  formData,
  isLoading,
  onNameChange,
  onPasswordChange,
  onConfirmPasswordChange,
}: RegisterStepsOptions): RegisterSteps {
  return [
    {
      title: "Регистрация",
      components: [
        {
          formFieldName: "credentials",
          componentKey: "register-credentials",
          component: AuthCredentialsStep,
          props: {
            name: formData.name,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            isLoading,
            onNameChange,
            onPasswordChange,
            onConfirmPasswordChange,
          },
        },
      ],
    },
  ];
}
