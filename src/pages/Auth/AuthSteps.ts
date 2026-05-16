import type React from "react";
import { Button } from "@mui/material";

import { AuthCredentialsStep } from "./Components/CommonAuthStepComponents.tsx";
import LoginField from "./Components/LoginField";
import PasswordField from "./Components/PasswordField";
export type RegisterFormData = {
  name: string;
  password: string;
  confirmPassword: string;
};

export type RegisterFormFieldName = keyof RegisterFormData | "credentials";
export type LoginFormFieldName = "credentials";

type ComponentProps = Record<string, unknown>;
type ValueChangeHandler<TValue> = {
  bivarianceHack: (value: TValue) => void;
}["bivarianceHack"];

export type AuthStepComponent<TFieldName extends string, TValue = string> = {
  formFieldName: TFieldName;
  componentKey: string;
  component: React.ElementType;
  value?: TValue;
  onChangeOnValue?: ValueChangeHandler<TValue>;
  props?: ComponentProps;
};

export type AuthFlowStep<TFieldName extends string, TValue = string> = {
  title: string;
  components: Array<AuthStepComponent<TFieldName, TValue>>;
};

export type RegisterFlowStep = AuthFlowStep<RegisterFormFieldName, string>;
export type LoginFlowStep = AuthFlowStep<LoginFormFieldName, string>;

export type RegisterSteps = RegisterFlowStep[];
export type LoginSteps = LoginFlowStep[];

type RegisterStepsOptions = {
  formData: RegisterFormData;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onBack: () => void;
};

type LoginStepsOptions = {
  name: string;
  password: string;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
};

export function getLoginSteps({
  name,
  password,
  isLoading,
  onNameChange,
  onPasswordChange,
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
            value: name,
            onChange: (
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
            value: password,
            onChange: (
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => onPasswordChange(event.target.value),
          },
        },
        {
          formFieldName: "credentials",
          componentKey: "login-submit-button",
          component: Button,
          props: {
            type: "submit",
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
  onBack,
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
            onBack,
          },
        },
      ],
    },
  ];
}
