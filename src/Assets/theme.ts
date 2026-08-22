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
    fontFamily: "'Manrope', 'Inter', sans-serif",
    h1: {
      fontFamily: "'Manrope', sans-serif",
      fontWeight: 800,
      letterSpacing: '-0.035em',
    },
    h2: {
      fontFamily: "'Manrope', sans-serif",
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontFamily: "'Manrope', sans-serif",
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
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
    borderRadius: 14,
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#2859d8',
      dark: '#1942b5',
      light: '#6f91ed',
      contrastText: '#ffffff',
    },
    brand: {
      main: '#2859d8',
      light: '#6f91ed',
      dark: '#1942b5',
      contrastText: '#fff',
    },
    secondary: {
      main: '#58705c',
    },
    success: {
      main: '#3f7650',
    },
    error: {
      main: '#b44444',
    },
    warning: {
      main: '#a56c1d',
    },
    background: {
      default: '#f7f5ef',
      paper: '#fffdf9',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: 14,
          textTransform: 'none',
          fontWeight: 750,
          transition: 'background-color 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: '#fffdf9',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          border: '1px solid rgba(29, 37, 48, 0.10)',
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 22,
          border: '1px solid rgba(29, 37, 48, 0.10)',
          backgroundImage: 'none',
          boxShadow: '0 14px 34px rgba(39, 45, 53, 0.07)',
        },
      },
    },
  },
});
