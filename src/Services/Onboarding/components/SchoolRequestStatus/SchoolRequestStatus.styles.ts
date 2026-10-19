import type { SxProps, Theme } from '@mui/material';
import type { SchoolRequestViewState } from '../../utils/schoolRequestStatus.utils';

export const container: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

export const header: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 2,
};

export const heading: SxProps<Theme> = {
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
};

export const statusIcon = (viewState: SchoolRequestViewState): SxProps<Theme> => ({
  flexShrink: 0,
  display: 'grid',
  placeItems: 'center',
  p: 1,
  borderRadius: 1,
  bgcolor: 'action.hover',
  color: viewState === 'approved' ? 'success.main' : viewState === 'rejected' ? 'error.main' : 'warning.main',
});

export const title: SxProps<Theme> = {
  typography: { xs: 'h5', sm: 'h4' },
  overflowWrap: 'anywhere',
};

export const schoolName: SxProps<Theme> = {
  overflowWrap: 'anywhere',
};

export const description: SxProps<Theme> = {
  color: 'text.secondary',
};
