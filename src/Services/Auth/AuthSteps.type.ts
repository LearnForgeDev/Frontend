import type { ElementType, MouseEventHandler } from 'react';

export type RegisterFormData = {
  name: string;
  password: string;
  confirmPassword: string;
};

export type RegisterFormFieldName = keyof RegisterFormData | "credentials";

export type LoginFormFieldName = "credentials";

export type ComponentProps = Record<string, unknown>;

export type ValueChangeHandler<TValue> = {
  bivarianceHack: (value: TValue) => void;
}["bivarianceHack"];

export type AuthStepComponent<TFieldName extends string, TValue = string> = {
  formFieldName: TFieldName;
  componentKey: string;
  component: ElementType;
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

export type RegisterStepsOptions = {
  formData: RegisterFormData;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
};

export type LoginStepsOptions = {
  name: string;
  password: string;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: MouseEventHandler<HTMLButtonElement>;
};
