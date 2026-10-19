import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import AppGlobalStyles from '@/Assets/globalStyles';
import { theme } from '@/Assets/theme';
import AppRoutes from './AppRoutes';
import { UserProvider } from '@/Storage/UserContext/UserContext.tsx';
import SessionQueryProvider from '@/Storage/QueryContext/SessionQueryProvider';
import ErrorBoundary from '@/Assets/Components/ErrorBoundary/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppGlobalStyles />
      <ErrorBoundary>
        <BrowserRouter>
          <SessionQueryProvider>
            <UserProvider>
              <AppRoutes />
            </UserProvider>
          </SessionQueryProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
);
