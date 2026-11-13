import type { ReactNode } from 'react';
import type { ToggleButtonGroupProps } from '@mui/material';

export interface PillChoice<T> {
    label: ReactNode;
    value: T;
}

export interface PillButtonGroupProps<T> extends Omit<ToggleButtonGroupProps, 'value' | 'onChange'> {
    options: PillChoice<T>[];
    value: T;
    onChange: (value: T) => void;
}
