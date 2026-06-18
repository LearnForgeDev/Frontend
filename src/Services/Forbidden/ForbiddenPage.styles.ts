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
    mb: 4,
    fontWeight: 'bold'
};

export const imageStyles: SxProps<Theme> = {
    maxWidth: '100%',
    maxHeight: '50vh',
    objectFit: 'contain',
    mb: 4,
};
