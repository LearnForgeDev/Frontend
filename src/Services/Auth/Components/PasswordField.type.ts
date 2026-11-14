import type { TextFieldProps } from '@mui/material';

export type PasswordFieldProps = Omit<TextFieldProps, 'type'> & {
    showToggle?: boolean;
    toggleTestId?: string;
};

export type InputSlotProps = NonNullable<TextFieldProps['slotProps']>['input'];

export type InputSlotPropsFunction = Extract<InputSlotProps, (...args: never[]) => unknown>;

export type InputSlotOwnerState = Parameters<InputSlotPropsFunction>[0];
