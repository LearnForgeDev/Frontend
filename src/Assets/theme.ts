import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#4968f2',
    },
    secondary: {
      main: '#6b5cff',
    },
    success: {
      main: '#2e7d32',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#e4ae18',
    },
    background: {
      default: '#f7f8fb',
      paper: '#ffffff',
    },
  },
});
