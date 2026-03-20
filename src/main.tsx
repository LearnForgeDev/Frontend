import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { applyTheme, getSystemTheme } from './styles/theme.tsx';

applyTheme(getSystemTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename='/Frontend/'>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
);
