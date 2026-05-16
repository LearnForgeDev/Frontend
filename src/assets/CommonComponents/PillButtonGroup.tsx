import React from 'react';
import { ToggleButton, Box, useTheme } from '@mui/material';
import type { ToggleButtonGroupProps } from '@mui/material';
import * as S from './PillButtonGroup.styles';

export interface PillChoice<T> {
    label: React.ReactNode;
    value: T;
}

export interface PillButtonGroupProps<T> extends Omit<ToggleButtonGroupProps, 'value' | 'onChange'> {
    options: PillChoice<T>[];
    value: T;
    onChange: (value: T) => void;
}

export default function PillButtonGroup<T extends NonNullable<unknown>>({ options, value, onChange, ...props }: PillButtonGroupProps<T>) {
    const theme = useTheme();
    const selectedIndex = options.findIndex((option) => option.value === value);
    const validIndex = Math.max(0, selectedIndex);

    return (
        <S.StyledToggleButtonGroup
            value={value}
            exclusive
            onChange={(_, newValue) => {
                if (newValue !== null) {
                    onChange(newValue);
                }
            }}
            {...props}
        >
            <Box sx={S.sliderTrack(theme)}>
                <Box sx={S.sliderThumb(theme, options.length, validIndex)} />
            </Box>
            {options.map((option, index) => (
                <ToggleButton key={index} value={option.value as NonNullable<unknown>} disableRipple>
                    {option.label}
                </ToggleButton>
            ))}
        </S.StyledToggleButtonGroup>
    );
}
