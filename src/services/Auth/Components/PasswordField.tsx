import {TextField, IconButton, InputAdornment} from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState, type ReactNode } from 'react';

type PasswordFieldProps = Omit<TextFieldProps, 'type'> & {
    showToggle?: boolean;
};

type InputSlotProps = NonNullable<TextFieldProps['slotProps']>['input'];
type InputSlotPropsFunction = Extract<InputSlotProps, (ownerState: unknown) => unknown>;
type InputSlotOwnerState = InputSlotPropsFunction extends (ownerState: infer TOwnerState) => unknown
    ? TOwnerState
    : unknown;

export default function PasswordField({ showToggle = true, slotProps, ...props }: PasswordFieldProps) {
    const [isVisible, setIsVisible] = useState(false);

    const inputSlotProps = slotProps?.input;
    const resolvedInputProps = typeof inputSlotProps === 'function'
        ? (ownerState: InputSlotOwnerState) => {
            // @ts-expect-error Не смотря на то, что у ownerState есть тип, ts его не воспринимает
            const inputProps = inputSlotProps(ownerState);
            const existingAdornment = inputProps?.endAdornment as ReactNode | undefined;

            return {
                ...inputProps,
                endAdornment: showToggle ? (
                    <InputAdornment position="end">
                        <IconButton
                            aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
                            edge="end"
                            onClick={() => setIsVisible((value) => !value)}
                        >
                            {isVisible ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                        {existingAdornment}
                    </InputAdornment>
                ) : existingAdornment,
            };
        }
        : {
            ...(inputSlotProps ?? {}),
            endAdornment: showToggle ? (
                <InputAdornment position="end">
                    <IconButton
                        aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
                        edge="end"
                        onClick={() => setIsVisible((value) => !value)}
                    >
                        {isVisible ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                    {(inputSlotProps as { endAdornment?: ReactNode } | undefined)?.endAdornment}
                </InputAdornment>
            ) : (inputSlotProps as { endAdornment?: ReactNode } | undefined)?.endAdornment,
        };

    return (
        <TextField
            type={isVisible ? 'text' : 'password'}
            variant="outlined"
            required
            fullWidth
            slotProps={{
                ...slotProps,
                input: resolvedInputProps,
            }}
            {...props}
        />
    );
}
