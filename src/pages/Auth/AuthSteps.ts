import type React from 'react';
import { Button } from '@mui/material';

import type { AuthRole } from '../../types/commonTypes';
import PillButtonGroup from '../../assets/CommonComponents/PillButtonGroup';
import { AuthCredentialsStep, AuthTextStep, InviteTokenInput } from './Components/CommonAuthStepComponents.tsx';
import LoginField from './Components/LoginField';
import PasswordField from './Components/PasswordField';

export type RegisterFormData = {
    inviteToken: string;
    schoolName: string;
    name: string;
    password: string;
    confirmPassword: string;
};

export type RegisterFormFieldName = keyof RegisterFormData | 'credentials' | 'role';
export type LoginFormFieldName = 'role' | 'credentials';

type ComponentProps = Record<string, unknown>;
type ValueChangeHandler<TValue> = {
    bivarianceHack: (value: TValue) => void;
}['bivarianceHack'];

export type AuthStepComponent<TFieldName extends string, TValue = string> = {
    formFieldName: TFieldName;
    componentKey: string;
    component: React.ElementType;
    value?: TValue;
    onChangeOnValue?: ValueChangeHandler<TValue>;
    props?: ComponentProps;
    roles?: readonly AuthRole[];
};

export type AuthFlowStep<TFieldName extends string, TValue = string> = {
    title: string;
    components: Array<AuthStepComponent<TFieldName, TValue>>;
};

export type RegisterFlowStep = AuthFlowStep<RegisterFormFieldName, string | AuthRole>;
export type LoginFlowStep = AuthFlowStep<LoginFormFieldName, AuthRole>;

export type RegisterSteps = RegisterFlowStep[];
export type LoginSteps = LoginFlowStep[];

type RegisterStepsOptions = {
    role: AuthRole;
    formData: RegisterFormData;
    isLoading: boolean;
    onRoleChange: (role: AuthRole) => void;
    roleToggleSx?: unknown;
    onInviteTokenChange: (value: string) => void;
    onSchoolNameChange: (value: string) => void;
    onNameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onConfirmPasswordChange: (value: string) => void;
    onBack: () => void;
};

type LoginStepsOptions = {
    role: AuthRole;
    onRoleChange: (role: AuthRole) => void;
    nameLabel: string;
    name: string;
    password: string;
    isLoading: boolean;
    onNameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    roleToggleSx?: unknown;
};

export const authRoleOptions: ReadonlyArray<{ label: string; value: AuthRole }> = [
    { label: 'Студент', value: 'student' },
    { label: 'Преподаватель', value: 'teacher' },
];

export function getLoginSteps({
    role,
    onRoleChange,
    nameLabel,
    name,
    password,
    isLoading,
    onNameChange,
    onPasswordChange,
    roleToggleSx,
}: LoginStepsOptions): LoginSteps {
    return [
        {
            title: 'С возвращением',
            components: [
                {
                    formFieldName: 'role',
                    componentKey: 'login-role-toggle',
                    component: PillButtonGroup,
                    value: role,
                    onChangeOnValue: onRoleChange,
                    props: {
                        options: authRoleOptions,
                        'aria-label': 'Роль',
                        ...(roleToggleSx ? { sx: roleToggleSx } : {}),
                    },
                },
                {
                    formFieldName: 'credentials',
                    componentKey: 'login-name-field',
                    component: LoginField,
                    props: {
                        nameLabel,
                        label: nameLabel,
                        value: name,
                        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onNameChange(event.target.value),
                        autoFocus: true,
                    },
                },
                {
                    formFieldName: 'credentials',
                    componentKey: 'login-password-field',
                    component: PasswordField,
                    props: {
                        label: 'Пароль',
                        value: password,
                        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onPasswordChange(event.target.value),
                    },
                },
                {
                    formFieldName: 'credentials',
                    componentKey: 'login-submit-button',
                    component: Button,
                    props: {
                        type: 'submit',
                        variant: 'contained',
                        color: 'primary',
                        size: 'large',
                        fullWidth: true,
                        disabled: isLoading,
                        children: isLoading ? 'Вход...' : 'Войти',
                    },
                },
            ],
        },
    ];
}

export function getRegisterSteps({
    role,
    formData,
    isLoading,
    onRoleChange,
    roleToggleSx,
    onInviteTokenChange,
    onSchoolNameChange,
    onNameChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onBack,
}: RegisterStepsOptions): RegisterSteps {
    return [
        {
            title: 'Регистрация',
            components: [
                {
                    formFieldName: 'role',
                    componentKey: 'register-role-toggle',
                    component: PillButtonGroup,
                    value: role,
                    onChangeOnValue: (value) => onRoleChange(value as AuthRole),
                    props: {
                        options: authRoleOptions,
                        'aria-label': 'Роль',
                        ...(roleToggleSx ? { sx: roleToggleSx } : {}),
                    },
                },
                {
                    formFieldName: 'inviteToken',
                    componentKey: 'register-invite-token',
                    component: InviteTokenInput,
                    value: formData.inviteToken,
                    onChangeOnValue: onInviteTokenChange,
                    roles: ['student'],
                    props: {
                        length: 6,
                    },
                },
                {
                    formFieldName: 'schoolName',
                    componentKey: 'register-school-name',
                    component: AuthTextStep,
                    value: formData.schoolName,
                    onChangeOnValue: onSchoolNameChange,
                    roles: ['teacher'],
                    props: {
                        label: 'Название школы',
                    },
                },
            ],
        },
        {
            title: 'Данные аккаунта',
            components: [
                {
                    formFieldName: 'credentials',
                    componentKey: 'register-credentials',
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
