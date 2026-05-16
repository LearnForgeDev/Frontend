import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import AppGlobalStyles from './styles/globalStyles';
import { theme } from './styles/theme';
import AppRoutes from './AppRoutes';
import { UserProvider } from './contexts/UserContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppGlobalStyles />
      <UserProvider>
        <BrowserRouter basename='/Frontend'>
          <AppRoutes />
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  </StrictMode>,
);
