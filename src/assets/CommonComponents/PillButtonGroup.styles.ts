import { ToggleButtonGroup, styled, type Theme } from '@mui/material';
import { type SxProps } from '@mui/system';

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    backgroundColor: theme.palette.action.hover,
    borderRadius: 50,
    padding: theme.spacing(0.5),
    position: 'relative',
    zIndex: 0,
    '& .MuiToggleButtonGroup-grouped': {
        margin: 0,
        border: 0,
        borderRadius: 50,
        textTransform: 'none',
        flex: 1,
        zIndex: 2,
        transition: 'color 0.3s ease',
        '&.Mui-selected': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            color: theme.palette.text.primary,
            '&:hover': {
                backgroundColor: 'transparent',
            },
        },
        '&:hover': {
            backgroundColor: 'transparent',
        },
        '&:not(:first-of-type)': {
            borderRadius: 50,
            borderLeft: 'none',
        },
        '&:first-of-type': {
            borderRadius: 50,
        },
    },
}));

export const sliderTrack = (theme: Theme): SxProps<Theme> => ({
    position: 'absolute',
    top: theme.spacing(0.5),
    bottom: theme.spacing(0.5),
    left: theme.spacing(0.5),
    right: theme.spacing(0.5),
    zIndex: 1,
    pointerEvents: 'none',
});

export const sliderThumb = (
    theme: Theme,
    optionsLength: number,
    validIndex: number
): SxProps<Theme> => ({
    width: `${100 / optionsLength}%`,
    height: '100%',
    transform: `translateX(${validIndex * 100}%)`,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: theme.palette.background.paper,
    borderRadius: 50,
    boxShadow: theme.shadows[1],
});

