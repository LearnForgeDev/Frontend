import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import AppGlobalStyles from '@/Assets/globalStyles';
import { theme } from '@/Assets/theme';
import AppRoutes from './AppRoutes';
import { UserProvider } from '@/Storage/Context/UserContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppGlobalStyles />
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </UserProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
