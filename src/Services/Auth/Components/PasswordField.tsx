import type { PasswordFieldProps, InputSlotOwnerState } from './PasswordField.type';
import { TextField, IconButton, InputAdornment } from '@mui/material';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState, type ReactNode } from 'react';

export default function PasswordField({ showToggle = true, toggleTestId = 'auth-password-toggle', slotProps, ...props }: PasswordFieldProps) {
    const [isVisible, setIsVisible] = useState(false);

    const inputSlotProps = slotProps?.input;
    const resolvedInputProps = typeof inputSlotProps === 'function'
        ? (ownerState: InputSlotOwnerState) => {
            const inputProps = inputSlotProps(ownerState);
            const existingAdornment = inputProps?.endAdornment;

            return {
                ...inputProps,
                endAdornment: showToggle ? (
                    <InputAdornment position="end">
                        <IconButton
                            data-testid={toggleTestId}
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
                        data-testid={toggleTestId}
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
