import type { SxProps, Theme } from '@mui/material/styles';

export const containerStyles: SxProps<Theme> = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    textAlign: 'center',
    p: 3,
};

export const titleStyles: SxProps<Theme> = {
    mb: 2,
    fontWeight: 'bold'
};

export const subtitleStyles: SxProps<Theme> = {
    mb: 2
};

export const descriptionStyles: SxProps<Theme> = {
    mb: 4
};
