import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import AppGlobalStyles from './styles/globalStyles';
import { theme } from './styles/theme';
import AppRoutes from './AppRoutes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename='/Frontend'>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/Lessons" element={<LessonsMainPage />} />
        <Route path='/Lessons/:lessonId' element={<LessonIdPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
);
