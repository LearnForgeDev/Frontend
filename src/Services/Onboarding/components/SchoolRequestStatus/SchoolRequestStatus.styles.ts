import type { SxProps, Theme } from '@mui/material';
import type { SchoolRequestViewState } from '../../utils/schoolRequestStatus.utils';

export const container: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: 1.5,
};

export const statusDot = (viewState: SchoolRequestViewState): SxProps<Theme> => ({
  width: 72,
  height: 72,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  bgcolor:
    viewState === 'approved'
      ? 'success.light'
      : viewState === 'rejected'
        ? 'error.light'
        : 'warning.light',
  color:
    viewState === 'approved'
      ? 'success.dark'
      : viewState === 'rejected'
        ? 'error.dark'
        : 'warning.dark',
  fontSize: 32,
  fontWeight: 800,
});

export const title: SxProps<Theme> = {
  fontWeight: 800,
};

export const description: SxProps<Theme> = {
  color: 'text.secondary',
  maxWidth: 520,
};
