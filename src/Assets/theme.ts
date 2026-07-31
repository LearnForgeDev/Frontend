import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    titleS: React.CSSProperties;
    bodyM: React.CSSProperties;
    bodyS: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    titleS?: React.CSSProperties;
    bodyM?: React.CSSProperties;
    bodyS?: React.CSSProperties;
  }
  interface Palette {
    brand: Palette['primary'];
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    titleS: true;
    bodyM: true;
    bodyS: true;
  }
}

export const theme = createTheme({
  typography: {
    fontFamily: "'Inter', sans-serif",
    titleS: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    bodyM: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    bodyS: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
    },
  },
  shape: {
    borderRadius: 12,
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#4968f2',
    },
    brand: {
      main: '#6b5cff',
      light: '#8c80ff',
      dark: '#4c3eff',
      contrastText: '#fff',
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
